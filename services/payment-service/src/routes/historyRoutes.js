import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getMyContactPayments,
  getMyPromotePayments,
  getPaymentSummary,
} from "../controller/paymentHistoryController.js";
 
const router = express.Router();
  
  
router.get("/history/contacts", authMiddleware,getMyContactPayments);
  
router.get("/history/promotions", authMiddleware,getMyPromotePayments);
  
router.get("/history/summary",authMiddleware, getPaymentSummary);
 
export default router;