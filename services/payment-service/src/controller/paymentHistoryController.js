// src/controller/paymentHistoryController.js
import mongoose from "mongoose";
import Payment from "../models/paymentModel.js";
import PromotePayment from "../models/PromotePayment.js";
import { redisGet, redisPost } from "../utils/redisClient.js";

const CACHE_TTL = 300; // 5 minutes

const buildKey = (prefix, userId, page, limit) =>
  `payments:${prefix}:${userId}:page=${page}:limit=${limit}`;

const summaryKey = (userId) => `payments:summary:${userId}`;
 
export const getMyContactPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const key = buildKey("contacts", userId, page, limit);

    const cached = await redisGet(`/cache/${encodeURIComponent(key)}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json({ success: true, ...cached.data, fromCache: true });
    }

    const [payments, total] = await Promise.all([
      Payment.find({ userId, status: "paid" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ userId, status: "paid" }),
    ]);

    const payload = {
      data: payments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await redisPost("/cache", { key, data: payload, ttl: CACHE_TTL });

    return res.status(200).json({ success: true, ...payload });
  } catch (error) {
    console.error("[getMyContactPayments]", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET /api/payments/my-promotions ─────────────────────────────────────────
export const getMyPromotePayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const key = buildKey("promotions", userId, page, limit);

    const cached = await redisGet(`/cache/${encodeURIComponent(key)}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json({ success: true, ...cached.data, fromCache: true });
    }

    const [payments, total] = await Promise.all([
      PromotePayment.find({ userId, status: "paid" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PromotePayment.countDocuments({ userId, status: "paid" }),
    ]);

    const payload = {
      data: payments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await redisPost("/cache", { key, data: payload, ttl: CACHE_TTL });

    return res.status(200).json({ success: true, ...payload });
  } catch (error) {
    console.error("[getMyPromotePayments]", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET /api/payments/summary ────────────────────────────────────────────────
export const getPaymentSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const key = summaryKey(userId);

    const cached = await redisGet(`/cache/${encodeURIComponent(key)}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json({ success: true, ...cached.data, fromCache: true });
    }

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

    const payload = {
      summary: {
        contactsRevealed: contactCount,
        listingsPromoted: promoteCount,
        totalSpent: (contactTotal[0]?.total || 0) + (promoteTotal[0]?.total || 0),
      },
    };

    await redisPost("/cache", { key, data: payload, ttl: CACHE_TTL });

    return res.status(200).json({ success: true, ...payload });
  } catch (error) {
    console.error("[getPaymentSummary]", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};