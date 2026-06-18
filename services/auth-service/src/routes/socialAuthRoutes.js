// routes/socialAuthRoutes.js
// Separate from authRoutes.js — only OAuth routes live here.

import express from "express";
import passport from "passport";
import {
  googleCallback,
  googleError,
} from "../controllers/socialAuthController.js";

const router = express.Router();

// ── Google ────────────────────────────────────────────────────────────────────


router.get(
  "/google",
  (req, res, next) => {
    console.log("Google OAuth started");
    next();
  },
  passport.authenticate("google", {
    scope: ["openid", "profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failWithError: true }),
  googleCallback,
  googleError
);

 

export default router;
