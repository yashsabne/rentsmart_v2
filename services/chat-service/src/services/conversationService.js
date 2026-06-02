const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { generateConversationSlug } = require("../utils/slugGenerator");
 
const findOrCreateConversation = async ({
    propertyId,
    propertyTitle,
    propertyImage,
    propertyLocation,
    propertyPrice,
    buyer,    
    owner,    
    text,
    iv,
}) => {
     const existing = await Conversation.findOne({
        propertyId,
        "participants.userId": { $all: [buyer.userId, owner.userId] },
    });

    if (existing) {
         return { conversation: existing, isNew: false };
    }

     const participants = [
        { ...buyer, role: "buyer" },
        { ...owner, role: "owner" },
    ];

     const unreadCounts = new Map();
    unreadCounts.set(owner.publicId, 1);
    unreadCounts.set(buyer.publicId, 0);

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

     await Message.create({
        conversationId: conversation._id,
        senderPublicId: buyer.publicId,
        text,
        iv,
        status: "sent",
    });

    return { conversation, isNew: true };
};
 
const getConversationsForUser = async (userId, filter = "all") => {
    const query = {
        "participants.userId": userId,
        isActive: true,
    };

 

    const conversations = await Conversation.find(query)
        .sort({ lastMessageAt: -1 })
        .lean();
        
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
        return !isArchived;  
    });
}; 
const getConversationBySlug = async (slug, userId) => {
    const conversation = await Conversation.findOne({
        conversationSlug: slug,
        "participants.userId": userId,
    }).lean();

    return conversation;  
};
 
const sanitiseConversation = (conv) => ({
    conversationSlug: conv.conversationSlug,
    propertyId: undefined,           
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