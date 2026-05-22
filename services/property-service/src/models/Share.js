// =============================================
// models/Share.js
// =============================================

import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },

    listingId: {
      type: String,
      required: true,
    },

    sharedBy: {
      type: String,
      default: null,
    },

    clicks: {
      type: Number,
      default: 0,
    },

    uniqueClicks: {
      type: Number,
      default: 0,
    },

    visitors: [
      {
        ip: String,
        device: String,
        visitedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Share",
  shareSchema
);