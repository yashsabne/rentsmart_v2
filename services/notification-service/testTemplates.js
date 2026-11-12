
import "dotenv/config";

import {
  generateEmail,
  NOTIFICATION_EVENTS,
} from "./src/services/templateService.js";

const testCases = [
  {
    event: NOTIFICATION_EVENTS.AUTH_VERIFICATION,
    payload: {
      email: "test@example.com",
      firstName: "Yash",
      verificationToken: "dummy-verification-token",
    },
  },
  {
    event: NOTIFICATION_EVENTS.AUTH_PASSWORD_RESET,
    payload: {
      email: "test@example.com",
      firstName: "Yash",
      resetToken: "dummy-reset-token",
    },
  },
  {
    event: NOTIFICATION_EVENTS.PAYMENT_SUCCESS,
    payload: {
      email: "test@example.com",
      tenantName: "Yash",
      ownerName: "Alex",
      propertyTitle: "2 BHK Apartment",
    },
  },
  {
    event: NOTIFICATION_EVENTS.PROMOTION_SUCCESS,
    payload: {
      email: "test@example.com",
      ownerName: "Alex",
      propertyTitle: "2 BHK Apartment",
    },
  },
  {
    event: NOTIFICATION_EVENTS.CONTACT_REVEALED,
    payload: {
      email: "test@example.com",
      tenantName: "Yash",
      ownerName: "Alex",
      ownerPhone: "9999999999",
      propertyTitle: "2 BHK Apartment",
    },
  },
  {
    event: NOTIFICATION_EVENTS.OWNER_CONTACT_REVEALED,
    payload: {
      email: "test@example.com",
      ownerName: "Alex",
      buyerName: "Yash",
      buyerEmail: "buyer@example.com",
      buyerPhone: "9999999999",
      propertyTitle: "2 BHK Apartment",
    },
  },
  {
    event: NOTIFICATION_EVENTS.NEW_MESSAGE,
    payload: {
      email: "test@example.com",
      recipientName: "Yash",
      senderName: "Alex",
      messagePreview: "Hello, is the property available?",
      chatLink: `${process.env.CLIENT_URL}/messages`,
    },
  },
];

for (const testCase of testCases) {
  try {
    const result = generateEmail(
      testCase.event,
      testCase.payload
    );

    console.log(`\n${testCase.event}`);
    console.log("Recipient:", result.to);
    console.log("Subject:", result.subject);
    console.log("HTML generated:", result.html.length > 0);
  } catch (error) {
    console.error(`FAILED: ${testCase.event}`, error.message);
  }
}
