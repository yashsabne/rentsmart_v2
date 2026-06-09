import express from "express";

import {
  checkAccess,
  createOrder,
  createPromoteOrder,
  verifyPayment,
  verifyPromotePayment,
} from "../controller/paymentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import requireVerifiedEmail from "../middleware/requireVerifiedEmail.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Payment API Running");
});

router.post("/create-order",authMiddleware,requireVerifiedEmail,createOrder);

router.post("/verify-payment",authMiddleware,requireVerifiedEmail,verifyPayment);

router.get("/check-access",authMiddleware, checkAccess);

router.post("/promote/order",  authMiddleware, createPromoteOrder);
router.post("/promote/verify", authMiddleware, verifyPromotePayment);

export default router;