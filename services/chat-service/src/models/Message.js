const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Message",
  messageSchema
);