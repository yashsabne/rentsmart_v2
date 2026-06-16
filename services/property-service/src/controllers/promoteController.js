// src/controller/promoteController.js 
import crypto from "crypto";
import Listing from "../models/Listings.js"; // adjust to your model name
import { redisDelete } from "../utils/redisClient.js";

// src/controller/listingController.js  (add this one function)

export const activatePromotion = async (req, res) => {
  try {
    const { listingId, paymentId } = req.body;

    const promotedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Listing.findByIdAndUpdate(listingId, {
      isPromoted: true,
      promotedUntil,
      promotedPaymentId: paymentId,
    });

    await redisDelete(`/cache/listing:${listingId}`);
    

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};