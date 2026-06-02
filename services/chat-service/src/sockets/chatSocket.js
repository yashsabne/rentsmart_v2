const { SOCKET_EVENTS } = require("../constants/events");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const onlineUsers = new Map();

const registerChatHandlers = (io, socket) => {
  const user = socket.user;
  const userId = String(user.id || user._id);

  if (!userId) {
    console.error("[socket] Missing user id");
    socket.disconnect(true);
    return;
  }

  onlineUsers.set(userId, socket.id);

  io.emit(SOCKET_EVENTS.USER_ONLINE, { userId });

  socket.on("getOnlineUsers", () => {
    socket.emit(SOCKET_EVENTS.ONLINE_USERS, getOnlineUsers());
  });

  socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, async ({ conversationSlug }) => {
    try {
      const conversation = await Conversation.findOne({ conversationSlug });

      if (!conversation) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Conversation not found.",
        });
      }

      const isParticipant = conversation.participants.some(
        (p) => String(p.userId) === userId
      );

      if (!isParticipant) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: "Access denied." });
      }

      socket.join(conversationSlug);

 
      const updatedMessages = await Message.updateMany(
        {
          conversationId: conversation._id,
          senderUserId: { $ne: userId },
          status: "sent",
        },
        { $set: { status: "delivered" } }
      );

      if (updatedMessages.modifiedCount > 0) {
        io.to(conversationSlug).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
          conversationSlug,
          deliveredTo: userId,
        });
      }
    } catch (err) {
      console.error("[socket joinConversation] Error:", err);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: "Failed to join conversation.",
      });
    }
  });

  socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, ({ conversationSlug }) => {
    socket.leave(conversationSlug); 
  });

  socket.on(
    SOCKET_EVENTS.SEND_MESSAGE,
    async ({ conversationSlug, messageData }) => {
      try {
        const conversation = await Conversation.findOne({ conversationSlug });
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => String(p.userId) === userId
        );
        if (!isParticipant) return;

        const recipient = conversation.participants.find(
          (p) => String(p.userId) !== userId
        );

        if (recipient && messageData._id) {
          const recipientSocketId = onlineUsers.get(String(recipient.userId));
          const recipientSocket = recipientSocketId
            ? io.sockets.sockets.get(recipientSocketId)
            : null;
          const recipientInRoom = recipientSocket?.rooms?.has(conversationSlug);

          if (recipientInRoom) {
            await Message.findByIdAndUpdate(messageData._id, {
              $set: { status: "delivered" },
            });
            messageData = { ...messageData, status: "delivered" };
          }
        }

        io.to(conversationSlug).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
          conversationSlug,
          message: messageData,
        });
      } catch (err) {
        console.error("[socket sendMessage] Error:", err);
      }
    }
  );

  socket.on(SOCKET_EVENTS.TYPING, ({ conversationSlug }) => {
    socket.to(conversationSlug).emit(SOCKET_EVENTS.TYPING, {
      conversationSlug,
      userId,
    });
  });

  socket.on(SOCKET_EVENTS.STOP_TYPING, ({ conversationSlug }) => {
    socket.to(conversationSlug).emit(SOCKET_EVENTS.STOP_TYPING, {
      conversationSlug,
      userId,
    });
  });

  socket.on(
    SOCKET_EVENTS.MESSAGE_READ,
    async ({ conversationSlug }) => {
      try {
        const conversation = await Conversation.findOne({ conversationSlug });
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => String(p.userId) === userId
        );
        if (!isParticipant) return;

        const readAt = new Date();

        await Message.updateMany(
          {
            conversationId: conversation._id,
            senderUserId: { $ne: userId },
            status: { $in: ["sent", "delivered"] },
          },
          { $set: { status: "read", readAt } }
        );

        io.to(conversationSlug).emit(SOCKET_EVENTS.MESSAGE_READ, {
          conversationSlug,
          readBy: userId,
          readAt: readAt.toISOString(),
        });
      } catch (err) {
        console.error("[socket messageRead] Error:", err);
      }
    }
  );

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    onlineUsers.delete(userId);

    io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
 
  });
};

const isUserOnline = (userId) => onlineUsers.has(String(userId));

const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { registerChatHandlers, isUserOnline, getOnlineUsers };