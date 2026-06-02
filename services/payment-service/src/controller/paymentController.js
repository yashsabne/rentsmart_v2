// src/controller/paymentController.js

import razorpay from "../config/razorpay.js";
import Payment from "../models/paymentModel.js";
import PromotePayment from "../models/PromotePayment.js";
import { logActivity } from "../utils/activityLogger.js";
import { sendNotification } from "../utils/sendNotification.js";
import crypto from "crypto";


export const createOrder = async (req, res) => {
  try {

    const {
      listingId,
      ownerId,
      email,
      ownerName,
      ownerPhone,
      propertyTitle,

      buyerName,
      buyerEmail,
      buyerPhone,
    } = req.body;

    const userId = req.user.id;

    const options = {
      amount: 3900,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      userId,

      listingId,

      ownerId,

      email,

      ownerName,

      ownerPhone,

      propertyTitle,

      buyerName,

      buyerEmail,

      buyerPhone,

      amount: 39,

      razorpayOrderId: order.id,
    });

    return res.status(200).json({
      success: true,
      order,
      payment,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });

  }
};

export const verifyPayment = async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        razorpay_order_id +
        "|" +
        razorpay_payment_id
      )
      .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const payment =
      await Payment.findOneAndUpdate(
        {
          razorpayOrderId:
            razorpay_order_id,
        },
        {
          razorpayPaymentId:
            razorpay_payment_id,

          status: "paid",

          accessGranted: true,
        },
        {
          new: true,
        }
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await sendNotification(
      "contact-revealed",
      {
        email:
          payment.email,

        ownerName:
          payment.ownerName,

        ownerPhone:
          payment.ownerPhone,
      }
    );

    await sendNotification(
      "payment-success",
      {
        email:
          payment.buyerEmail,

        ownerName:
          payment.ownerName,

        propertyTitle:
          payment.propertyTitle,
      }
    );

    await sendNotification(
      "owner-contact-revealed",
      {
        ownerId:
          payment.ownerId,

        buyerName:
          payment.buyerName,

        buyerEmail:
          payment.buyerEmail,

        buyerPhone:
          payment.buyerPhone,

        propertyTitle:
          payment.propertyTitle,
      }
    );

    await logActivity(
      payment.userId,
      "PAYMENT_COMPLETED",
      {
        amount:
          payment.amount,

        propertyTitle:
          payment.propertyTitle,

        paymentId:
          razorpay_payment_id,
      }
    );

    await logActivity(
      payment.userId,
      "CONTACT_REVEALED",
      {
        propertyTitle:
          payment.propertyTitle,

        ownerName:
          payment.ownerName,
      }
    );

    await logActivity(
      payment.ownerId,
      "CONTACT_VIEWED",
      {
        propertyTitle:
          payment.propertyTitle,

        buyerName:
          payment.buyerName,

        buyerEmail:
          payment.buyerEmail,

        buyerPhone:
          payment.buyerPhone,
      }
    );

    return res.status(200).json({
      success: true,
      payment,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });

  }
};

 
export const createPromoteOrder = async (req, res) => {
  try {
    const { listingId, propertyTitle } = req.body;
    const userId = req.user.id;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "Listing ID is required",
      });
    }

    const options = {
      amount: 3900,
      currency: "INR",
      receipt: `promo_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await PromotePayment.create({
      userId,
      listingId,
      propertyTitle,
      amount: 39,
      razorpayOrderId: order.id,
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("[createPromoteOrder]", error);
    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

export const verifyPromotePayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const payment = await PromotePayment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: "paid",
        promotedAt: new Date(),
        expiresAt,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const activateResponse = await fetch(
      `${process.env.PROPERTY_SERVICE_URL}/api/promote/listings/promote/activate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: payment.listingId,
          paymentId: razorpay_payment_id,
          promotedAt: payment.promotedAt,
          expiresAt: payment.expiresAt,
        }),
      }
    );

    if (!activateResponse.ok) {
      console.error("Promotion activation failed");
    }

    await logActivity(payment.userId, "LISTING_PROMOTED", {
      propertyTitle: payment.propertyTitle,
      listingId: payment.listingId,
      paymentId: razorpay_payment_id,
      promotedAt: payment.promotedAt,
      expiresAt: payment.expiresAt,
    });

    await sendNotification("promote-success", {
      userId: payment.userId,
      propertyTitle: payment.propertyTitle,
    });

    return res.status(200).json({
      success: true,
      payment,
      promotedUntil: payment.expiresAt,
    });
  } catch (error) {
    console.error("[verifyPromotePayment]", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};