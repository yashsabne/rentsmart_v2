// src/controller/paymentHistoryController.js
import mongoose from "mongoose";
import Payment from "../models/paymentModel.js";
import PromotePayment from "../models/PromotePayment.js";


export const getMyContactPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId, status: "paid" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ userId, status: "paid" }),
    ]);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getMyContactPayments]", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/payments/my-promotions
 * Returns all promote payments for the logged-in user.
 */
export const getMyPromotePayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      PromotePayment.find({ userId, status: "paid" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PromotePayment.countDocuments({ userId, status: "paid" }),
    ]);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getMyPromotePayments]", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/payments/summary
 * Returns aggregate stats for the logged-in user's payments.
 */
export const getPaymentSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [contactCount, promoteCount, contactTotal, promoteTotal] = await Promise.all([
      Payment.countDocuments({ userId, status: "paid" }),
      PromotePayment.countDocuments({ userId, status: "paid" }),
      Payment.aggregate([
        { $match: { userId, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },

      ]),
      PromotePayment.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        contactsRevealed: contactCount,
        listingsPromoted: promoteCount,
        totalSpent:
          (contactTotal[0]?.total || 0) + (promoteTotal[0]?.total || 0),
      },
    });
  } catch (error) {
    console.error("[getPaymentSummary]", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};