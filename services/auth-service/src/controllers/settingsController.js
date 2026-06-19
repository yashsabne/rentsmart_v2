import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";
import { redisDelete, redisPost } from "../utils/redisClient.js";

const bustUserCache = async (userId) => {
    await redisDelete(`/cache/user:${userId}`);
};

// ─── GET /api/auth/settings ──────────────────────────────────────────────────
export const getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "firstName lastName email phone city preferences " +
            "emailNotifications smsNotifications whatsappNotifications " +
            "isEmailVerified premiumMember googleId microsoftId createdAt"
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, city } = req.body;

        if (!firstName || !phone) {
            return res.status(400).json({ success: false, message: "First name and phone are required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const changedFields = [];
        if (firstName.trim() !== user.firstName) changedFields.push("first name");
        if ((lastName || "").trim() !== (user.lastName || "")) changedFields.push("last name");
        if (phone.trim() !== user.phone) changedFields.push("phone number");
        if ((city || "").trim() !== (user.city || "")) changedFields.push("city");

        user.firstName = firstName.trim();
        user.lastName = (lastName || "").trim();
        user.phone = phone.trim();
        user.city = (city || "").trim();

        await user.save();
        await bustUserCache(req.user.id);

        if (changedFields.length > 0) {
            await logActivity(req.user.id, "PROFILE_UPDATED", {
                field: changedFields.join(", "),
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated",
            data: { firstName: user.firstName, lastName: user.lastName, phone: user.phone, city: user.city },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updateNotifications = async (req, res) => {
    try {
        const { emailNotifications, smsNotifications, whatsappNotifications } = req.body;

        const patch = {};
        const changedLabels = [];

        if (typeof emailNotifications === "boolean") {
            patch.emailNotifications = emailNotifications;
            changedLabels.push(`email notifications ${emailNotifications ? "on" : "off"}`);
        }
        if (typeof smsNotifications === "boolean") {
            patch.smsNotifications = smsNotifications;
            changedLabels.push(`SMS notifications ${smsNotifications ? "on" : "off"}`);
        }
        if (typeof whatsappNotifications === "boolean") {
            patch.whatsappNotifications = whatsappNotifications;
            changedLabels.push(`WhatsApp notifications ${whatsappNotifications ? "on" : "off"}`);
        }

        if (Object.keys(patch).length === 0) {
            return res.status(400).json({ success: false, message: "No valid notification fields provided" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: patch },
            { new: true, select: "emailNotifications smsNotifications whatsappNotifications" }
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        await bustUserCache(req.user.id);

        await logActivity(req.user.id, "PROFILE_UPDATED", {
            field: `notification preferences (${changedLabels.join(", ")})`,
        });

        return res.status(200).json({
            success: true,
            message: "Notification preferences updated",
            data: {
                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications,
                whatsappNotifications: user.whatsappNotifications,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updatePreferences = async (req, res) => {
    try {
        const { preferences, city } = req.body;
        const VALID = ["1 BHK", "2 BHK", "3 BHK", "Villa", "Studio", "Commercial"];

        if (preferences !== undefined) {
            if (!Array.isArray(preferences)) {
                return res.status(400).json({ success: false, message: "preferences must be an array" });
            }
            const invalid = preferences.filter((p) => !VALID.includes(p));
            if (invalid.length > 0) {
                return res.status(400).json({ success: false, message: `Invalid values: ${invalid.join(", ")}` });
            }
        }

        const patch = {};
        const changedLabels = [];

        if (preferences !== undefined) {
            patch.preferences = preferences;
            changedLabels.push(`property preferences (${preferences.length > 0 ? preferences.join(", ") : "none"})`);
        }
        if (city !== undefined) {
            patch.city = city.trim();
            changedLabels.push(`preferred city to "${city.trim()}"`);
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: patch },
            { new: true, select: "preferences city" }
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        await bustUserCache(req.user.id);

        // activityConfig PROFILE_UPDATED → meta.field
        await logActivity(req.user.id, "PROFILE_UPDATED", {
            field: changedLabels.join(" and "),
        });

        return res.status(200).json({
            success: true,
            message: "Preferences updated",
            data: { preferences: user.preferences, city: user.city },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PATCH /api/auth/settings/password ───────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Both passwords are required" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: "New password must differ from current" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "Your account uses Google / Microsoft login — no password to change",
            });
        }

        const rateLimitResult = await redisPost("/rate-limit/check", {
            identifier: `change-password:${req.user.id}`,
            max: 5,
            ttl: 900,
        });
        if (rateLimitResult && !rateLimitResult.allowed) {
            return res.status(429).json({ success: false, message: "Too many attempts. Try again later." });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.hashPassword();
        await user.save();
        await bustUserCache(req.user.id);

        // activityConfig PASSWORD_RESET → text uses meta.ip
        await logActivity(req.user.id, "PASSWORD_RESET", {
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        });

        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.password) {
            if (!password) {
                return res.status(400).json({ success: false, message: "Please confirm your password to continue" });
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Incorrect password" });
            }
        }
  


        user.email = `deleted_${Date.now()}${user._id}@removed.local`;
        user.password = undefined;
        user.googleId = undefined;
        user.microsoftId = undefined;
        user.isEmailVerified = false;
        user.deletedAt = new Date();
        await user.save();

        await redisDelete(`/cache/user:${req.user.id}`);
        await redisDelete(`/session/${req.user.id}`);

        if (req.token) {
            await redisPost("/token/blacklist", { token: req.token, ttl: 432000 });
        }


        fetch(`${process.env.PROPERTY_SERVICE_URL}/api/property/internal/users/${req.user.id}/hide-listings`, {
            method: "POST",
            headers: { "x-internal-secret": process.env.INTERNAL_SECRET },
        }).catch((err) => console.error("Failed to hide listings:", err.message));


        return res.status(200).json({ success: true, message: "Account deleted" });



    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};