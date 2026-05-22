import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createListing, 
  searchListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  getRecommended,
  getFilteredListings,
} from "../controllers/propertyController.js";
import requireVerifiedEmail from "../middleware/requireVerifiedEmail.js";

const router = express.Router();

// MULTER (for Cloudinary upload)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// ROUTES

router.post("/", authMiddleware,requireVerifiedEmail, createListing);
 

// IMPORTANT: specific routes first
router.get("/filter", getFilteredListings);
router.get("/search", searchListings);
router.get("/recommended", getRecommended);
router.get("/my", authMiddleware, getMyListings);
router.get("/details/:id", getListingById);

// PROTECTED ROUTES
router.put("/:id", authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

export default router;