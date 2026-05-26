 
const SOCKET_EVENTS = { 
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
 
const ACTIVITY_EVENTS = {
  CHAT_STARTED: "CHAT_STARTED",
  MESSAGE_SENT: "MESSAGE_SENT",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  MESSAGE_READ: "MESSAGE_READ",
};

module.exports = { SOCKET_EVENTS, ACTIVITY_EVENTS };