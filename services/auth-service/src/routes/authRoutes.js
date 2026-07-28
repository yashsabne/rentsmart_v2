import express from "express";
import os from "os";
const router = express.Router();

import {
  register,
  login,
  logout,
  getMe,
  getUserById,
  verifyEmail,
  resendVerificationEmail,
  checkVerification,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rateLimitMiddleware from "../middleware/rateLimitMiddleware.js";
import { verifyInternalSecret } from "../middleware/verifyInternalSecret.js";
import User from "../models/User.js";
import { addRecentlyViewed, getRecentlyViewed } from "../controllers/recentlyViewedController.js";

router.post("/register", rateLimitMiddleware(5, 3600), register);
router.post("/login", rateLimitMiddleware(10, 900), login);

router.post("/logout", authMiddleware, logout);

router.get("/me", authMiddleware, getMe);

router.get("/user/:id", getUserById);
 

router.get("/internal/user/:id", verifyInternalSecret, async (req, res) => {
 
  try {
    const user = await User.findById(req.params.id)
      .select("firstName lastName email phone");
 

    if (!user) return res.status(404).json({ user: null });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

 

router.get("/verify-email/:token", verifyEmail);

router.post("/resend-verification", authMiddleware, resendVerificationEmail);
router.get("/check-verification/:userId", checkVerification);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


router.patch("/recently-viewed", authMiddleware, addRecentlyViewed);
router.get("/recently-viewed",  authMiddleware, getRecentlyViewed);

export default router;
