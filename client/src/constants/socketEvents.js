// Frontend mirror of backend socket event constants
// Must stay in sync with chat-service/src/constants/events.js

export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  JOIN_CONVERSATION: "joinConversation",
  LEAVE_CONVERSATION: "leaveConversation",

  SEND_MESSAGE: "sendMessage",
  RECEIVE_MESSAGE: "receiveMessage",

  TYPING: "typing",
  STOP_TYPING: "stopTyping",

  MESSAGE_READ: "messageRead",
  MESSAGE_DELIVERED: "messageDelivered",

  ONLINE_PRESENCE: "onlinePresence",
  USER_ONLINE: "userOnline",
  USER_OFFLINE: "userOffline",

  ERROR: "chatError",
};