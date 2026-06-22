import express from "express";

import {
  paymentSuccess,
  contactRevealed,
  ownerContactRevealed,
} from "../controller/notificationController.js";
import { verifyInternalSecret } from "../middleware/verifyInternalSecret.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Notification API Running");
});

router.post("/payment-success",verifyInternalSecret,paymentSuccess);

router.post("/contact-revealed",verifyInternalSecret,contactRevealed);

router.post("/owner-contact-revealed",verifyInternalSecret,ownerContactRevealed);

export default router;