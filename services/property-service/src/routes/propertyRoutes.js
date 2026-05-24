import express from "express";
import { upload } from "../config/cloudinary.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireVerifiedEmail from "../middleware/requireVerifiedEmail.js";
import {
  createListing,
  searchListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  getRecommended,
  getFilteredListings,
  uploadPhotos,
} from "../controllers/propertyController.js";

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

// PUBLIC ROUTES 
router.get("/filter",      getFilteredListings);
router.get("/search",      searchListings);
router.get("/recommended", getRecommended);
router.get("/my",          authMiddleware, getMyListings);
router.get("/details/:id", getListingById);

// PROTECTED ROUTES
router.put("/:id",    authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

export default router;