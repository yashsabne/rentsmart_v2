import express from "express";
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
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rateLimitMiddleware from "../middleware/rateLimitMiddleware.js";

router.post("/register", rateLimitMiddleware(5, 3600), register);
router.post("/login", rateLimitMiddleware(10, 900), login);

router.post("/logout", authMiddleware, logout);

router.get("/me", authMiddleware, getMe);

router.get("/user/:id", getUserById);

router.get("/verify-email/:token", verifyEmail);

router.post("/resend-verification", authMiddleware, resendVerificationEmail);
router.get("/check-verification/:userId", checkVerification);

export default router;
