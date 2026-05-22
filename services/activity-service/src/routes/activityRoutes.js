import express from "express";

const router = express.Router();

import {
  createActivity,
  getActivities,
} from "../controllers/activityController.js";

router.post(
  "/",
  createActivity
);

router.get(
  "/:userId",
  getActivities
);

export default router;