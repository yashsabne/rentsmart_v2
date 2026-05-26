const { SOCKET_EVENTS } = require("../constants/events");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { logMessageReceived } = require("../services/activityService");

 const onlineUsers = new Map();

 
const registerChatHandlers = (io, socket) => {
  const user = socket.user;
  const userId = user.id || user._id;

  if (!userId) {
    console.error("[socket] Missing user id");
    socket.disconnect(true);
    return;
  }

 
  onlineUsers.set(String(userId), socket.id);

  io.emit(SOCKET_EVENTS.USER_ONLINE, {
    userId,
  });

  console.log(
    `[socket] User connected: ${userId} (${socket.id})`
  );

 
  socket.on(
    SOCKET_EVENTS.JOIN_CONVERSATION,
    async ({ conversationSlug }) => {
      try {
        const conversation = await Conversation.findOne({
          conversationSlug,
        });

        if (!conversation) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: "Conversation not found.",
          });
        }

        const isParticipant = conversation.participants.some(
          (p) => String(p.userId) === String(userId)
        );

        if (!isParticipant) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: "Access denied.",
          });
        }

        socket.join(conversationSlug);

        console.log(
          `[socket] ${userId} joined room: ${conversationSlug}`
        );

        await Message.updateMany(
          {
            conversationId: conversation._id,
            senderUserId: {
              $ne: userId,
            },
            status: "sent",
          },
          {
            $set: {
              status: "delivered",
            },
          }
        );

        io.to(conversationSlug).emit(
          SOCKET_EVENTS.MESSAGE_DELIVERED,
          {
            conversationSlug,
            deliveredTo: userId,
          }
        );
      } catch (err) {
        console.error(
          "[socket joinConversation] Error:",
          err
        );

        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Failed to join conversation.",
        });
      }
    }
  );

 
  socket.on(
    SOCKET_EVENTS.LEAVE_CONVERSATION,
    ({ conversationSlug }) => {
      socket.leave(conversationSlug);

      console.log(
        `[socket] ${userId} left room: ${conversationSlug}`
      );
    }
  );

 
  socket.on(
    SOCKET_EVENTS.SEND_MESSAGE,
    async ({ conversationSlug, messageData }) => {
      try {
        const conversation = await Conversation.findOne({
          conversationSlug,
        });

        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => String(p.userId) === String(userId)
        );

        if (!isParticipant) return;

        io.to(conversationSlug).emit(
          SOCKET_EVENTS.RECEIVE_MESSAGE,
          {
            conversationSlug,
            message: messageData,
          }
        );

        const recipient = conversation.participants.find(
          (p) => String(p.userId) !== String(userId)
        );

        if (recipient) {
          try {
            await logMessageReceived(
              recipient.userId,
              conversationSlug
            );
          } catch (err) {
            console.error(
              "[activity-service] MESSAGE_RECEIVED failed:",
              err.message
            );
          }
        }
      } catch (err) {
        console.error(
          "[socket sendMessage] Error:",
          err
        );
      }
    }
  );

 
  socket.on(
    SOCKET_EVENTS.TYPING,
    ({ conversationSlug }) => {
      socket.to(conversationSlug).emit(
        SOCKET_EVENTS.TYPING,
        {
          conversationSlug,
          userId,
        }
      );
    }
  );

  socket.on(
    SOCKET_EVENTS.STOP_TYPING,
    ({ conversationSlug }) => {
      socket.to(conversationSlug).emit(
        SOCKET_EVENTS.STOP_TYPING,
        {
          conversationSlug,
          userId,
        }
      );
    }
  );

 
  socket.on(
    SOCKET_EVENTS.MESSAGE_READ,
    async ({ conversationSlug }) => {
      try {
        io.to(conversationSlug).emit(
          SOCKET_EVENTS.MESSAGE_READ,
          {
            conversationSlug,
            readBy: userId,
            readAt: new Date().toISOString(),
          }
        );
      } catch (err) {
        console.error(
          "[socket messageRead] Error:",
          err
        );
      }
    }
  );
  
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    onlineUsers.delete(String(userId));

    io.emit(SOCKET_EVENTS.USER_OFFLINE, {
      userId,
    });

    console.log(
      `[socket] User disconnected: ${userId}`
    );
  });
};
 
const isUserOnline = (userId) =>
  onlineUsers.has(String(userId));
 
const getOnlineUsers = () =>
  Array.from(onlineUsers.keys());

module.exports = {
  registerChatHandlers,
  isUserOnline,
  getOnlineUsers,
};