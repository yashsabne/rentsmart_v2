 

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";
import { redisPost, redisDelete } from "../utils/redisClient.js";

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

 
function generateToken(user) {
  return jwt.sign({
    id: user._id,
    city: user.city || null,
    preferences: user.preferences || [],
  }, process.env.JWT_SECRET, { expiresIn: "5d" });
}

/**
 * Sends a postMessage to the opener popup window and closes it.
 * Mirrors the same popup flow used in authService.js on the frontend.
 */
function sendPopupMessage(res, type, payload) {
  const data = JSON.stringify({ type, ...payload });
  return res.send(`<!DOCTYPE html><html><body><script>
    window.opener?.postMessage(${data}, ${JSON.stringify(CLIENT_URL)});
    window.close();
  <\/script></body></html>`);
}

 
async function handleSocialCallback(req, res, provider) {
  const profile = req.user; // set by Passport strategy

  try {
    const providerIdField = `${provider}Id`; // "googleId" 

    // ── 1. Find existing user by provider ID or email ─────────────────────
    let user = await User.findOne({ [providerIdField]: profile.id });

    if (!user && profile.email) {
      user = await User.findOne({ email: profile.email });
    }

    // ── 2. Create user if not found ───────────────────────────────────────
    if (!user) {
      user = new User({
        [providerIdField]: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName ?? "",
        phone: "",                    // social users have no phone yet — prompt later if required
        isEmailVerified: true,        // OAuth-verified emails are trusted
        emailNotifications: true,
        smsNotifications: true,
        whatsappNotifications: false,
      });
      await user.save();
    } else if (!user[providerIdField]) {
      // ── 3. Link provider ID to existing email account ──────────────────
      user[providerIdField] = profile.id;
      await user.save();
    }

    // ── 4. Invalidate stale user cache ────────────────────────────────────
    await redisDelete(`/cache/user:${user._id}`);

    // ── 5. Create Redis session (same shape as login controller) ──────────
    await redisPost("/session", {
      userId: user._id.toString(),
      sessionData: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        loginAt: new Date().toISOString(),
      },
    });

    // ── 6. Log activity ───────────────────────────────────────────────────
    const userAgent = req.headers["user-agent"] || "";
    await logActivity(user._id, `${provider.toUpperCase()}_LOGIN`, {
      loginAt: new Date().toISOString(),
      device: /mobile/i.test(userAgent) ? "Mobile" : "Desktop",
      userAgent,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });

    // ── 7. Generate JWT ───────────────────────────────────────────────────
    const token = generateToken(user._id);

    return sendPopupMessage(res, "OAUTH_SUCCESS", {
      payload: { message: "Login successful", token },
    });
  } catch (err) {
    console.error(`[SocialAuth] ${provider} callback error:`, err);
    return sendPopupMessage(res, "OAUTH_ERROR", {
      error: err.message ?? `${provider} auth failed`,
    });
  }
}

// ── Google ────────────────────────────────────────────────────────────────────

export const googleCallback = (req, res) => handleSocialCallback(req, res, "google");

export const googleError = (err, req, res, _next) => {
  console.error("[SocialAuth] Google strategy error:", err.message);
  sendPopupMessage(res, "OAUTH_ERROR", { error: err.message ?? "Google auth failed" });
};