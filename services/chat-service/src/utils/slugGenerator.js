const { nanoid } = require("nanoid");

/**
 * Generates a unique conversation slug.
 * Format: chat-rs-x8kd92p3
 * Never exposes Mongo ObjectIds in URLs.
 */
const generateConversationSlug = () => {
  // nanoid(8) gives 8 random URL-safe characters
  return `chat-rs-${nanoid(8).toLowerCase()}`;
};

/**
 * Generates a public user ID.
 * Format: USR-9DK3P8
 */
const generatePublicUserId = () => {
  return `USR-${nanoid(6).toUpperCase()}`;
};

module.exports = { generateConversationSlug, generatePublicUserId };