import express from "express";
const router = express.Router();

import { register, login, getMe, getUserById, verifyEmail, resendVerificationEmail, checkVerification } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
 
router.post("/register", register);
router.post("/login", login);
 
router.get("/me", authMiddleware, getMe);

router.get("/user/:id", getUserById);

router.get("/verify-email/:token",verifyEmail);

router.post("/resend-verification",authMiddleware,resendVerificationEmail);
router.get("/check-verification/:userId", checkVerification); 

export default router;