// Socket.IO event name constants — used by both server and client
const SOCKET_EVENTS = {
  // Connection lifecycle
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  // Room management
  JOIN_CONVERSATION: "joinConversation",
  LEAVE_CONVERSATION: "leaveConversation",

  // Messaging
  SEND_MESSAGE: "sendMessage",
  RECEIVE_MESSAGE: "receiveMessage",

  // Typing
  TYPING: "typing",
  STOP_TYPING: "stopTyping",

  // Read/Delivery status
  MESSAGE_READ: "messageRead",
  MESSAGE_DELIVERED: "messageDelivered",

  // Presence
  ONLINE_PRESENCE: "onlinePresence",
  USER_ONLINE: "userOnline",
  USER_OFFLINE: "userOffline",

  // Errors
  ERROR: "chatError",
};

// Activity service event types
const ACTIVITY_EVENTS = {
  CHAT_STARTED: "CHAT_STARTED",
  MESSAGE_SENT: "MESSAGE_SENT",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  MESSAGE_READ: "MESSAGE_READ",
};

module.exports = { SOCKET_EVENTS, ACTIVITY_EVENTS };