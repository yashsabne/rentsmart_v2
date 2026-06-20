import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../services/sendVerificationEmail.js";
import { logActivity } from "../utils/activityLogger.js";
import { redisPost, redisGet, redisDelete } from "../utils/redisClient.js";
import { verifyInternalSecret } from "../middleware/verifyInternalSecret.js";
import { sendForgotPasswordEmail } from "../services/sendForgotPasswordEmail.js";


export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, city, preferences, notifications } = req.body;

    const rateLimitResult = await redisPost("/rate-limit/check", {
      identifier: `register:${req.headers["x-forwarded-for"] || req.socket.remoteAddress}`,
      max: 5,
      ttl: 3600,
    });

    if (rateLimitResult && !rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        message: "Too many registration attempts. Please try again later.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      city,
      preferences: preferences || [],
      emailNotifications: notifications?.emailAlerts ?? true,
      smsNotifications: notifications?.smsUpdates ?? true,
      whatsappNotifications: notifications?.whatsappNotifications ?? false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    if (password) await user.hashPassword();

    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Fire and forget
    sendVerificationEmail(
      user.email,
      user.firstName,
      verifyLink
    ).catch((error) => {
      console.error("Verification email failed:", error);
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const userResponse = user.toObject();

    delete userResponse.password;

    await redisPost("/session", {
      userId: user._id.toString(),
      sessionData: { id: user._id, email: user.email, firstName: user.firstName },
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify youWr email.",
      token,
      user: userResponse,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    const rateLimitIdentifier = email
      ? `login:email:${email}`
      : `login:phone:${phone}`;

    const rateLimitResult = await redisPost("/rate-limit/check", {
      identifier: rateLimitIdentifier,
      max: 10,
      ttl: 900,
    });

    if (rateLimitResult && !rateLimitResult.allowed) {

      return res.status(429).json({
        success: false,
        message: "Too many login attempts. Please try again later.",
      });
    }

    let user;

    if (email) {
      user = await User.findOne({ email });
    } else {
      const cleanPhone = phone.replace(/\D/g, "");
      user = await User.findOne({ phone: cleanPhone });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });

    const userAgent = req.headers["user-agent"] || "";

    await redisPost("/session", {
      userId: user._id.toString(),
      sessionData: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        loginAt: new Date().toISOString(),
      },
    });

    await logActivity(user._id, "LOGIN", {
      loginAt: new Date().toISOString(),
      device: /mobile/i.test(userAgent) ? "Mobile" : "Desktop",
      userAgent,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });

    return res.json({ message: "Login successful", token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.token;
    const userId = req.user.id;

    if (token) {
      await redisPost("/token/blacklist", { token, ttl: 432000 });
    }

    await redisDelete(`/session/${userId}`);

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const cached = await redisGet(`/cache/${encodeURIComponent(`user:${userId}`)}`);

    if (cached?.success && cached?.data) {
      return res.status(200).json(cached.data);
    }

    const user = await User.findById(userId).select(
      "-password -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationExpiry -deletedAt -googleId -microsoftId -contactAccess.monthlyEmailResetAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await redisPost("/cache", {
      key: `user:${userId}`,
      data: user.toObject(),
      ttl: 300,
    });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;


    const cached = await redisGet(`/cache/${encodeURIComponent(`user:public:${userId}`)}`);

    if (cached?.success && cached?.data) {
      return res.status(200).json(cached.data);
    }

    const user = await User.findById(userId).select(
      "-password -phone -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationExpiry -deletedAt -googleId -microsoftId -contactAccess -savedProperties -recentlyViewed -emailNotifications -smsNotifications -whatsappNotifications"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await redisPost("/cache", {
      key: `user:public:${userId}`,
      data: user.toObject(),
      ttl: 300,
    });

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;


    const user = await User.findOne({ emailVerificationToken: token });


    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid verification link" });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ success: true, message: "Email already verified" });
    }

    if (!user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Verification link expired" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;

    await user.save();

    await redisDelete(`/cache/user:${user._id}`);

    await logActivity(user._id, "EMAIL_VERIFIED", { email: user.email });

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify Email Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    const rateLimitResult = await redisPost("/rate-limit/check", {
      identifier: `resend-verify:${req.user.id}`,
      max: 3,
      ttl: 3600,
    });

    if (rateLimitResult && !rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        message: "Too many resend attempts. Please try again later.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendVerificationEmail(user.email, user.firstName, verifyLink);

    return res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.error("Resend Verification Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const checkVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("isEmailVerified");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, verified: user.isEmailVerified });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const rateLimitResult = await redisPost("/rate-limit/check", {
      identifier: `forgot-password:${email}`,
      max: 3,
      ttl: 3600,
    });

    if (rateLimitResult && !rateLimitResult.allowed) {
      const retryAfterSeconds = rateLimitResult.ttl;
      const minutes = Math.ceil(retryAfterSeconds / 60);
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: retryAfterSeconds,
        retryAfterMinutes: minutes,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered, you'll receive a reset link.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    sendForgotPasswordEmail(user.email, user.firstName, resetLink).catch((err) => {
      console.error("Reset email failed:", err);
    });

    return res.status(200).json({
      success: true,
      message: "If that email is registered, you'll receive a reset link.",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link" });
    }

    user.password = password;
    await user.hashPassword();
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    await redisDelete(`/cache/user:${user._id}`);

    await logActivity(user._id, "PASSWORD_RESET", {
      resetAt: new Date().toISOString(),
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
