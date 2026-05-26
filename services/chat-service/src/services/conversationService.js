const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { generateConversationSlug } = require("../utils/slugGenerator");

// ─── findOrCreateConversation ─────────────────────────────────────────────────
// The core "send first message" logic.
// Checks if a conversation already exists for (propertyId, buyerId, ownerId).
// If yes — reuses it (returns existing slug).
// If no  — creates new conversation + stores first message.
const findOrCreateConversation = async ({
    propertyId,
    propertyTitle,
    propertyImage,
    propertyLocation,
    propertyPrice,
    buyer,   // { userId, publicId, fullName, email, avatar }
    owner,   // { userId, publicId, fullName, email, avatar }
    text,
    iv,
}) => {
    // Look for existing conversation between these two users on this property
    const existing = await Conversation.findOne({
        propertyId,
        "participants.userId": { $all: [buyer.userId, owner.userId] },
    });

    if (existing) {
        // Conversation already exists — just return the slug for redirect
        return { conversation: existing, isNew: false };
    }

    // Build participants array [buyer, owner]
    const participants = [
        { ...buyer, role: "buyer" },
        { ...owner, role: "owner" },
    ];

    // Initialise unread counts — buyer sent first message so owner has 1 unread
    const unreadCounts = new Map();
    unreadCounts.set(owner.publicId, 1);
    unreadCounts.set(buyer.publicId, 0);

    // Create conversation
    const conversation = await Conversation.create({
        conversationSlug: generateConversationSlug(),
        propertyId,
        propertyTitle,
        propertyImage: propertyImage || "",
        propertyLocation: propertyLocation || "",
        propertyPrice: propertyPrice || 0,
        participants,
        lastMessageAt: new Date(),
        lastMessagePreview: { text, iv },
        unreadCounts,
    });

    // Store the first message
    await Message.create({
        conversationId: conversation._id,
        senderPublicId: buyer.publicId,
        text,
        iv,
        status: "sent",
    });

    return { conversation, isNew: true };
};

// ─── getConversationsForUser ──────────────────────────────────────────────────
// Returns all conversations where the user is a participant,
// sorted newest first, excluding archived ones.
const getConversationsForUser = async (userId, filter = "all") => {
    const query = {
        "participants.userId": userId,
        isActive: true,
    };

    

    console.log("userId", userId);

    const conversations = await Conversation.find(query)
        .sort({ lastMessageAt: -1 })
        .lean();

    console.log("found conversations", conversations.length);

    if (conversations.length) {
        console.log(JSON.stringify(conversations[0], null, 2));
    }

    // Apply client-side filters after fetching (small dataset per user)
    const userPublicId = conversations[0]?.participants.find(
        (p) => p.userId.toString() === userId.toString()
    )?.publicId;

    return conversations.filter((conv) => {
        const isArchived = conv.archivedBy?.get
            ? conv.archivedBy.get(userPublicId)
            : (conv.archivedBy || {})[userPublicId];

        if (filter === "archived") return isArchived;
        if (filter === "unread") {
            const unread = conv.unreadCounts?.get
                ? conv.unreadCounts.get(userPublicId)
                : (conv.unreadCounts || {})[userPublicId];
            return !isArchived && (unread || 0) > 0;
        }
        return !isArchived; // "all" — exclude archived
    });
};

// ─── getConversationBySlug ────────────────────────────────────────────────────
// Returns a single conversation by slug, verifying the requesting user
// is a participant (access control).
const getConversationBySlug = async (slug, userId) => {
    const conversation = await Conversation.findOne({
        conversationSlug: slug,
        "participants.userId": userId,
    }).lean();

    return conversation; // null if not found or not a participant
};

// ─── sanitiseConversation ─────────────────────────────────────────────────────
// Strips internal Mongo ObjectIds from the response sent to the client.
// Only publicIds and slug-based identifiers are exposed.
const sanitiseConversation = (conv) => ({
    conversationSlug: conv.conversationSlug,
    propertyId: undefined,          // never expose
    propertyTitle: conv.propertyTitle,
    propertyImage: conv.propertyImage,
    propertyLocation: conv.propertyLocation,
    propertyPrice: conv.propertyPrice,
    participants: conv.participants.map((p) => ({
        publicId: p.publicId,
        fullName: p.fullName,
        email: p.email,
        avatar: p.avatar,
        role: p.role,
        // userId intentionally omitted
    })),
    lastMessageAt: conv.lastMessageAt,
    lastMessagePreview: conv.lastMessagePreview,
    unreadCounts: conv.unreadCounts,
    archivedBy: conv.archivedBy,
    createdAt: conv.createdAt,
});

module.exports = {
    findOrCreateConversation,
    getConversationsForUser,
    getConversationBySlug,
    sanitiseConversation,
};