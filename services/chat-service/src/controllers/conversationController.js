const { validationResult } = require("express-validator");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { generateConversationSlug } = require("../utils/slugGenerator");
const { redisPost, redisGet, redisDelete } = require("../utils/redisClient");

const startConversation = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      propertyId, propertyTitle, propertyImage,
      propertyLocation, propertyPrice,
      text, iv,
    } = req.body;

    const buyerUserId = req.user.id;

    if (!buyerUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authResponse = await fetch(
      `${process.env.AUTH_SERVICE_URL}/api/auth/me`,
      { method: "GET", headers: { Authorization: req.headers.authorization } }
    );

    if (!authResponse.ok) {
      return res.status(401).json({ success: false, message: "Unable to fetch user profile" });
    }

    const buyerProfile = await authResponse.json();

    const buyer = {
      userId: buyerProfile._id || buyerProfile.id,
      fullName:
        buyerProfile.fullName ||
        buyerProfile.name ||
        `${buyerProfile.firstName || ""} ${buyerProfile.lastName || ""}`.trim(),
      email: buyerProfile.email,
      avatar: buyerProfile.avatar || "",
      role: "buyer",
    };

    const ownerData = req.body.owner;

    const owner = {
      userId: ownerData.userId,
      fullName: ownerData.fullName,
      email: ownerData.email,
      avatar: ownerData.avatar || "",
      role: "owner",
    };

    const existing = await Conversation.findOne({
      propertyId,
      "participants.userId": { $all: [buyer.userId, owner.userId] },
    });

    if (existing) {
      const newMessage = await Message.create({
        conversationId: existing._id,
        senderUserId: buyer.userId,
        text,
        iv,
        status: "sent",
      });

      existing.lastMessageAt = new Date();
      existing.lastMessage = text;
      await existing.save();

      await Promise.all([
        redisDelete(`/cache/conversations:${buyer.userId}`),
        redisDelete(`/cache/conversations:${owner.userId}`),
        redisDelete(`/cache/conversation:slug:${existing.conversationSlug}`),
      ]);

      return res.status(200).json({
        success: true,
        isNew: false,
        conversationSlug: existing.conversationSlug,
        messageId: newMessage._id,
      });
    }

    const conversationSlug = generateConversationSlug();

    const conversation = await Conversation.create({
      conversationSlug,
      propertyId, propertyTitle,
      propertyImage: propertyImage || "",
      propertyLocation: propertyLocation || "",
      propertyPrice: propertyPrice || "",
      participants: [buyer, owner],
      lastMessageAt: new Date(),
      lastMessage: text,
    });

    const firstMessage = await Message.create({
      conversationId: conversation._id,
      senderUserId: buyer.userId,
      text,
      status: "sent",
    });

    await Promise.all([
      redisDelete(`/cache/conversations:${buyer.userId}`),
      redisDelete(`/cache/conversations:${owner.userId}`),
    ]);

    return res.status(201).json({
      success: true,
      isNew: true,
      conversationSlug,
      messageId: firstMessage._id,
    });
  } catch (error) {
    console.error("[startConversation]", error);
    return res.status(500).json({ success: false, message: "Failed to start conversation" });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const cached = await redisGet(`/cache/conversations:${userId}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json({ conversations: cached.data });
    }

    const conversations = await Conversation.find({
      "participants.userId": userId,
      isActive: true,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    const safe = conversations.map((c) => ({
      conversationSlug: c.conversationSlug,
      propertyId: c.propertyId,
      propertyTitle: c.propertyTitle,
      propertyImage: c.propertyImage,
      propertyLocation: c.propertyLocation,
      propertyPrice: c.propertyPrice,
      participants: c.participants.map((p) => ({
        userId: p.userId,
        fullName: p.fullName,
        email: p.email,
        avatar: p.avatar,
        role: p.role,
      })),
      lastMessageAt: c.lastMessageAt,
      lastMessage: c.lastMessage,
      isArchived:
        Array.isArray(c.archivedBy) &&
        c.archivedBy.some((id) => String(id) === String(userId)),
      createdAt: c.createdAt,
    }));

    await redisPost("/cache", {
      key: `conversations:${userId}`,
      data: safe,
      ttl: 60,
    });

    return res.status(200).json({ conversations: safe });
  } catch (error) {
    console.error("[getConversations] Error:", error);
    return res.status(500).json({ message: "Failed to fetch conversations." });
  }
};

const getConversationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const cached = await redisGet(`/cache/conversation:slug:${slug}`);
    if (cached?.success && cached?.data) {
      const isParticipant = cached.data.participants.some(
        (p) => String(p.userId) === String(userId)
      );

      if (!isParticipant) {
        return res.status(403).json({ message: "Access denied." });
      }

      return res.status(200).json({ conversation: cached.data });
    }

    const conversation = await Conversation.findOne({ conversationSlug: slug }).lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied." });
    }

    const safe = {
      conversationSlug: conversation.conversationSlug,
      propertyId: conversation.propertyId,
      propertyTitle: conversation.propertyTitle,
      propertyImage: conversation.propertyImage,
      propertyLocation: conversation.propertyLocation,
      propertyPrice: conversation.propertyPrice,
      participants: conversation.participants.map((p) => ({
        userId: p.userId,
        fullName: p.fullName,
        email: p.email,
        avatar: p.avatar,
        role: p.role,
      })),
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
    };

    await redisPost("/cache", {
      key: `conversation:slug:${slug}`,
      data: safe,
      ttl: 120,
    });

    return res.status(200).json({ conversation: safe });
  } catch (error) {
    console.error("[getConversationBySlug] Error:", error);
    return res.status(500).json({ message: "Failed to fetch conversation." });
  }
};

const archiveConversation = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({ conversationSlug: slug });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (!conversation.archivedBy.includes(userId)) {
      conversation.archivedBy.push(userId);
      await conversation.save();
    }

    await Promise.all([
      redisDelete(`/cache/conversations:${userId}`),
      redisDelete(`/cache/conversation:slug:${slug}`),
    ]);

    return res.status(200).json({ message: "Conversation archived." });
  } catch (error) {
    console.error("[archiveConversation] Error:", error);
    return res.status(500).json({ message: "Failed to archive conversation." });
  }
};

module.exports = {
  startConversation,
  getConversations,
  getConversation: getConversationBySlug,
  archiveConversation,
};