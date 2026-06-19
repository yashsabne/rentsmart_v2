import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSettings,
  updateProfile,
  updateNotifications,
  updatePreferences,
  changePassword,
  deleteAccount,
} from "../controllers/settingsController.js";

const router = express.Router();

router.use(authMiddleware);

router.get   ("/",              getSettings);
router.patch ("/profile",       updateProfile);
router.patch ("/notifications", updateNotifications);
router.patch ("/preferences",   updatePreferences);
router.patch ("/password",      changePassword);
router.delete("/account",       deleteAccount);

export default router;