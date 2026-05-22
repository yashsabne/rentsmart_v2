import express from "express";

import {
  paymentSuccess,
  contactRevealed,
} from "../controller/notificationController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Notification API Running");
});

router.post(
  "/payment-success",
  paymentSuccess
);

router.post(
  "/contact-revealed",
  contactRevealed
);

export default router;