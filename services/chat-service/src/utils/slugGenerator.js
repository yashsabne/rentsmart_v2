const { nanoid } = require("nanoid");
 
const generateConversationSlug = () => {
   return `chat-rs-${nanoid(8).toLowerCase()}`;
};
 
const generatePublicUserId = () => {
  return `USR-${nanoid(6).toUpperCase()}`;
};

module.exports = { generateConversationSlug, generatePublicUserId };