const { validationResult } = require("express-validator");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const {
  logMessageSent,
  logMessageRead,
} = require("../services/activityService");

const PAGE_SIZE = 30;

 
const sendMessage = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const { conversationSlug, text, iv } = req.body;

    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      conversationSlug,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => String(p.userId) === String(userId)
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderUserId: userId,
      text,
       status: "sent",
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessage = text;
 
    await conversation.save();

    try {
      await logMessageSent(
        userId,
        conversationSlug
      );
    } catch (err) {
      console.error(
        "[activity-service] MESSAGE_SENT failed:",
        err.message
      );
    }

    return res.status(201).json({
      success: true,
      message: {
        _id: message._id,
        senderUserId: message.senderUserId,
        text: message.text, 
        status: message.status,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error("[sendMessage] Error:", error);

    return res.status(500).json({
      message: "Failed to send message.",
    });
  }
};

 
const getMessages = async (req, res) => {
  try {
    const { slug } = req.params;
    const { before } = req.query;

    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      conversationSlug: slug,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => String(p.userId) === String(userId)
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const query = {
      conversationId: conversation._id,
    };

    if (before) {
      query._id = {
        $lt: before,
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(PAGE_SIZE)
      .lean();

    const chronological = messages.reverse();

    const safe = chronological.map((m) => ({
      _id: m._id,
      senderUserId: m.senderUserId,
      text: m.text,
       status: m.status,
      readAt: m.readAt,
      createdAt: m.createdAt,
    }));

    return res.status(200).json({
      messages: safe,
      hasMore: messages.length === PAGE_SIZE,
    });
  } catch (error) {
    console.error("[getMessages] Error:", error);

    return res.status(500).json({
      message: "Failed to fetch messages.",
    });
  }
};
 
const markMessagesRead = async (req, res) => {
  try {
    const { conversationSlug } = req.body;

    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      conversationSlug,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => String(p.userId) === String(userId)
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const result = await Message.updateMany(
      {
        conversationId: conversation._id,
        senderUserId: {
          $ne: userId,
        },
        status: {
          $ne: "read",
        },
      },
      {
        $set: {
          status: "read",
          readAt: new Date(),
        },
      }
    );

    try {
      await logMessageRead(
        userId,
        conversationSlug
      );
    } catch (err) {
      console.error(
        "[activity-service] MESSAGE_READ failed:",
        err.message
      );
    }

    return res.status(200).json({
      updated: result.modifiedCount,
    });
  } catch (error) {
    console.error("[markMessagesRead] Error:", error);

    return res.status(500).json({
      message: "Failed to mark messages read.",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessagesRead,
};