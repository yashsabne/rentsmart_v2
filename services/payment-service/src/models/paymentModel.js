// src/models/paymentModel.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  listingId: { type: String, required: true },
  ownerId: { type: String, required: true },

  // Contact details — stored server-side, never from client
  email: { type: String },         // buyer email
  ownerName: { type: String },
  ownerPhone: { type: String },
  propertyTitle: { type: String },
  buyerName: { type: String },
  buyerEmail: { type: String },
  buyerPhone: { type: String },

  amount: { type: Number, required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,

  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created",
  },

  accessGranted: { type: Boolean, default: false },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;