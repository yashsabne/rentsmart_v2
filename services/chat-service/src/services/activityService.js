const { ACTIVITY_EVENTS } = require("../constants/events");

 
const logActivity = async (eventType, userId, metadata = {}) => {
  try {
    const response = await fetch(
      `${process.env.ACTIVITY_SERVICE_URL}/activities`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          userId,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      console.warn(
        `[activity-service] Failed to log event: ${eventType} for user ${userId}`
      );
    }
  } catch (error) {
     console.warn(`[activity-service] Could not reach activity-service:`, error.message);
  }
};

 const logChatStarted = (userId, conversationSlug, propertyId) =>
  logActivity(ACTIVITY_EVENTS.CHAT_STARTED, userId, {
    conversationSlug,
    propertyId,
  });

const logMessageSent = (userId, conversationSlug) =>
  logActivity(ACTIVITY_EVENTS.MESSAGE_SENT, userId, { conversationSlug });

const logMessageReceived = (userId, conversationSlug) =>
  logActivity(ACTIVITY_EVENTS.MESSAGE_RECEIVED, userId, { conversationSlug });

const logMessageRead = (userId, conversationSlug) =>
  logActivity(ACTIVITY_EVENTS.MESSAGE_READ, userId, { conversationSlug });

module.exports = {
  logChatStarted,
  logMessageSent,
  logMessageReceived,
  logMessageRead,
};