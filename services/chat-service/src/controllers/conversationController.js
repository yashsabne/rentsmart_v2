const { validationResult } = require("express-validator");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { generateConversationSlug } = require("../utils/slugGenerator");
const {
  logChatStarted,
  logMessageSent,
} = require("../services/activityService");

/**
 * POST /conversations/start
 * Creates a new conversation OR reuses existing one for same buyer+owner+property.
 * Also stores the first message (encrypted).
 */
const startConversation = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const {
      propertyId,
      propertyTitle,
      propertyImage,
      propertyLocation,
      propertyPrice,

      ownerId,
      ownerName,
      ownerEmail,
      ownerAvatar,

      text,
      iv,
    } = req.body;

    
    console.log("BODY");
    console.log(req.body);

    const buyerUserId = req.user.id;

    if (!buyerUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ------------------------------------------------
    // Fetch buyer profile from auth-service
    // ------------------------------------------------

    const authResponse = await fetch(
      `${process.env.AUTH_SERVICE_URL}/api/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    if (!authResponse.ok) {
      return res.status(401).json({
        success: false,
        message: "Unable to fetch user profile",
      });
    }

    const buyerProfile = await authResponse.json();

    console.log("BUYER PROFILE");
    console.log(buyerProfile);

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

    // ------------------------------------------------
    // Check existing conversation
    // ------------------------------------------------

    const existing = await Conversation.findOne({
      propertyId,
      "participants.userId": {
        $all: [buyer.userId, owner.userId],
      },
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

      await logMessageSent(
        buyer.userId,
        existing.conversationSlug
      );

      return res.status(200).json({
        success: true,
        isNew: false,
        conversationSlug: existing.conversationSlug,
        messageId: newMessage._id,
      });
    }

    // ------------------------------------------------
    // Create conversation
    // ------------------------------------------------

    const conversationSlug = generateConversationSlug();

    const conversation = await Conversation.create({
      conversationSlug,

      propertyId,
      propertyTitle,
      propertyImage: propertyImage || "",
      propertyLocation: propertyLocation || "",
      propertyPrice: propertyPrice || "",

      participants: [
        buyer,
        owner,
      ],

      lastMessageAt: new Date(),
      lastMessage: text,
     });

    const firstMessage = await Message.create({
      conversationId: conversation._id,
      senderUserId: buyer.userId,
      text, 
      status: "sent",
    });

    await logChatStarted(
      buyer.userId,
      conversationSlug,
      propertyId
    );

    await logMessageSent(
      buyer.userId,
      conversationSlug
    );

    return res.status(201).json({
      success: true,
      isNew: true,
      conversationSlug,
      messageId: firstMessage._id,
    });
  } catch (error) {
    console.error("[startConversation]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start conversation",
    });
  }
};

/**
 * GET /conversations
 * Returns all conversations for the authenticated user.
 * Excludes raw Mongo IDs from response.
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id || req.user.id;

    const conversations = await Conversation.find({
      "participants.userId": userId,
      isActive: true,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Strip internal Mongo IDs — only expose safe fields
    const safe = conversations.map((c) => ({
      conversationSlug: c.conversationSlug,
      propertyId: c.propertyId,
      propertyTitle: c.propertyTitle,
      propertyImage: c.propertyImage,
      propertyLocation: c.propertyLocation,
      propertyPrice: c.propertyPrice,
      participants: c.participants.map((p) => ({
        fullName: p.fullName,
        email: p.email,
        avatar: p.avatar,
        role: p.role,
      })),
      lastMessageAt: c.lastMessageAt,
      lastMessage: c.lastMessage,
       isArchived:
        Array.isArray(c.archivedBy) &&
        c.archivedBy.some(
          (id) => String(id) === String(userId)
        ),
      createdAt: c.createdAt,
    }));

    return res.status(200).json({ conversations: safe });
  } catch (error) {
    console.error("[getConversations] Error:", error);
    return res.status(500).json({ message: "Failed to fetch conversations." });
  }
};

/**
 * GET /conversations/:slug
 * Returns a single conversation by slug.
 */
const getConversationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id || req.user.id;

    const conversation = await Conversation.findOne({
      conversationSlug: slug,
    }).lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    // Security: only participants can view
    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Strip Mongo IDs
    const safe = {
      conversationSlug: conversation.conversationSlug,
      propertyId: conversation.propertyId,
      propertyTitle: conversation.propertyTitle,
      propertyImage: conversation.propertyImage,
      propertyLocation: conversation.propertyLocation,
      propertyPrice: conversation.propertyPrice,
      participants: conversation.participants.map((p) => ({
        fullName: p.fullName,
        email: p.email,
        avatar: p.avatar,
        role: p.role,
      })),
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
    };

    return res.status(200).json({ conversation: safe });
  } catch (error) {
    console.error("[getConversationBySlug] Error:", error);
    return res.status(500).json({ message: "Failed to fetch conversation." });
  }
};

/**
 * PATCH /conversations/archive/:slug
 * Soft-archives a conversation for the requesting user only.
 */
const archiveConversation = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id || req.user.id;

    const conversation = await Conversation.findOne({
      conversationSlug: slug,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Add userId to archivedBy array if not already there
    if (!conversation.archivedBy.includes(userId)) {
      conversation.archivedBy.push(userId);
      await conversation.save();
    }

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