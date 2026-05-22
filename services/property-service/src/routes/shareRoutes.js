// =============================================
// routes/shareRoutes.js
// =============================================

import express from "express";

import {
  createShareLink,
  openShareLink,
} from "../controllers/shareController.js";

const router = express.Router();

// create share link
router.post(
  "/create-link",
  createShareLink
);

// open shared link
router.get(
  "/open/:token",
  openShareLink
);

export default router;