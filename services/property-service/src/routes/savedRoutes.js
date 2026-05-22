import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  toggleSavedProperty,
  getSavedIds,
  getSavedProperties,
} from "../controllers/savedController.js";

const router = express.Router();

router.post(
  "/:propertyId",
  authMiddleware,
  toggleSavedProperty
);

router.get(
  "/ids",
  authMiddleware,
  getSavedIds
);

router.get(
  "/properties",
  authMiddleware,
  getSavedProperties
);

export default router;