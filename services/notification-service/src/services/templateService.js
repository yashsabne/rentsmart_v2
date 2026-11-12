
import { verificationTemplate } from "../templates/auth/verification.js";
import { forgotPasswordTemplate } from "../templates/auth/forgotPassword.js";

import { paymentSuccessTemplate } from "../templates/payment/paymentSuccess.js";
import { promotionSuccessTemplate } from "../templates/payment/promotionSuccess.js";

import { contactRevealedTemplate } from "../templates/property/contactRevealed.js";
import { newMessageTemplate } from "../templates/chat/newMessage.js";

export const NOTIFICATION_EVENTS = Object.freeze({
  AUTH_VERIFICATION: "AUTH_VERIFICATION",
  AUTH_PASSWORD_RESET: "AUTH_PASSWORD_RESET",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PROMOTION_SUCCESS: "PROMOTION_SUCCESS",
  CONTACT_REVEALED: "CONTACT_REVEALED",
  OWNER_CONTACT_REVEALED: "OWNER_CONTACT_REVEALED",
  NEW_MESSAGE: "NEW_MESSAGE",
});

const validateRequired = (payload, fields) => {
  for (const field of fields) {
    if (
      payload[field] === undefined ||
      payload[field] === null ||
      String(payload[field]).trim() === ""
    ) {
      throw new Error(`Missing required notification field: ${field}`);
    }
  }
};

const validateEmail = (email) => {
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("Invalid recipient email address");
  }
};

const buildClientLink = (path) => {
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    throw new Error("CLIENT_URL is not configured");
  }

  const baseUrl = new URL(clientUrl);

  if (baseUrl.protocol !== "https:" && baseUrl.hostname !== "localhost") {
    throw new Error("CLIENT_URL must use HTTPS");
  }

  return new URL(path, baseUrl).toString();
};

const templates = {
  [NOTIFICATION_EVENTS.AUTH_VERIFICATION]: (payload) => {
    validateRequired(payload, ["email", "firstName", "verificationToken"]);

    return {
      to: payload.email,
      ...verificationTemplate({
        firstName: payload.firstName,
        verificationLink: buildClientLink(
          `/verify-email/${encodeURIComponent(payload.verificationToken)}`
        ),
      }),
    };
  },

  [NOTIFICATION_EVENTS.AUTH_PASSWORD_RESET]: (payload) => {
    validateRequired(payload, ["email", "firstName", "resetToken"]);

    return {
      to: payload.email,
      ...forgotPasswordTemplate({
        firstName: payload.firstName,
        resetLink: buildClientLink(
          `/reset-password/${encodeURIComponent(payload.resetToken)}`
        ),
      }),
    };
  },

  [NOTIFICATION_EVENTS.PAYMENT_SUCCESS]: (payload) => {
    validateRequired(payload, [
      "email",
      "tenantName",
      "ownerName",
      "propertyTitle",
    ]);

    return {
      to: payload.email,
      ...paymentSuccessTemplate(payload),
    };
  },

  [NOTIFICATION_EVENTS.PROMOTION_SUCCESS]: (payload) => {
    validateRequired(payload, ["email", "ownerName", "propertyTitle"]);

    return {
      to: payload.email,
      ...promotionSuccessTemplate(payload),
    };
  },

  [NOTIFICATION_EVENTS.CONTACT_REVEALED]: (payload) => {
    validateRequired(payload, [
      "email",
      "tenantName",
      "ownerName",
      "ownerPhone",
      "propertyTitle",
    ]);

    return {
      to: payload.email,
      ...contactRevealedTemplate({
        ...payload,
        recipientType: "TENANT",
      }),
    };
  },

  [NOTIFICATION_EVENTS.OWNER_CONTACT_REVEALED]: (payload) => {
    validateRequired(payload, [
      "email",
      "ownerName",
      "buyerName",
      "buyerEmail",
      "buyerPhone",
      "propertyTitle",
    ]);

    return {
      to: payload.email,
      ...contactRevealedTemplate({
        ...payload,
        recipientType: "OWNER",
      }),
    };
  },

  [NOTIFICATION_EVENTS.NEW_MESSAGE]: (payload) => {
    validateRequired(payload, [
      "email",
      "recipientName",
      "senderName",
      "messagePreview",
      "chatLink",
    ]);

    const chatUrl = new URL(payload.chatLink);
    const clientUrl = new URL(process.env.CLIENT_URL);

    if (chatUrl.origin !== clientUrl.origin) {
      throw new Error("Chat link must belong to the RentSmart application");
    }

    return {
      to: payload.email,
      ...newMessageTemplate({
        recipientName: payload.recipientName,
        senderName: payload.senderName,
        messagePreview: payload.messagePreview,
        chatLink: chatUrl.toString(),
      }),
    };
  },
};

export const generateEmail = (eventType, payload) => {
  if (!templates[eventType]) {
    throw new Error(`Unsupported notification event: ${eventType}`);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid notification payload");
  }

  validateEmail(payload.email);

  return templates[eventType](payload);
};
