// src/models/paymentModel.js

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    listingId: {
      type: String,
      required: true,
    },

    ownerId: {
      type: String,
      required: true,
    },
    email: String,
    ownerName: String,
    ownerPhone: String,
    propertyTitle: String,

    buyerName: String,
    buyerEmail: String,
    buyerPhone: String,

    amount: {
      type: Number,
      required: true,
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },

    accessGranted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;