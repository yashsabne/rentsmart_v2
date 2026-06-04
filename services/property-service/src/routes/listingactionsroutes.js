import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  toggleHideListing,
  refreshListing,
  updateListingStatus,
  getOwnerDashboard,
} from "../controllers/listingActionController.js";

const router = express.Router();

router.patch("/:id/hide",    authMiddleware, toggleHideListing);
router.patch("/:id/refresh", authMiddleware, refreshListing);
router.patch("/:id/status",  authMiddleware, updateListingStatus);
router.get("/dashboard/owner", authMiddleware, getOwnerDashboard);

export default router;