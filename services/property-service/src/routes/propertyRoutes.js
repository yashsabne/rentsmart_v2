import express from "express";
import { upload } from "../config/cloudinary.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireVerifiedEmail from "../middleware/requireVerifiedEmail.js";
import {
  createListing, 
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  getRecommended,
  getFilteredListings,
  uploadPhotos,
  getSimilarListings,
  getNotLoggedRecommended,
  hideListingsByOwner,
} from "../controllers/propertyController.js";
import { verifyInternalSecret } from "../middleware/verifyInternalSecret.js";

const router = express.Router();

// PHOTO UPLOAD — standalone endpoint
// POST /api/property/upload-photos
router.post(
  "/upload-photos",
  authMiddleware,
  requireVerifiedEmail,
  upload.array("photos", 8),
  uploadPhotos
);

// CREATE LISTING
router.post("/", authMiddleware, requireVerifiedEmail, createListing);
 
router.get("/filter",      getFilteredListings);
router.get("/similar",      getSimilarListings);
router.get("/recommended", getRecommended);
router.get("/search-notlogged", getNotLoggedRecommended);
router.get("/my",          authMiddleware, getMyListings);
router.get("/details/:id", getListingById);

// PROTECTED ROUTES
router.put("/:id",    authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

router.post("/internal/users/:userId/hide-listings", verifyInternalSecret, hideListingsByOwner);

export default router;