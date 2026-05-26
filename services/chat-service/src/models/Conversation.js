const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["buyer", "owner"],
      required: true,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    conversationSlug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    propertyId: {
      type: String,
      required: true,
    },

    propertyTitle: {
      type: String,
      required: true,
    },

    propertyImage: {
      type: String,
      default: "",
    },

    propertyLocation: {
      type: String,
      default: "",
    },

    propertyPrice: {
      type: Number,
      default: "",
    },

    participants: {
      type: [participantSchema],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Conversation must contain exactly 2 participants.",
      },
    },

    // Last message preview for conversation list
    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({
  propertyId: 1,
  "participants.userId": 1,
});

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);