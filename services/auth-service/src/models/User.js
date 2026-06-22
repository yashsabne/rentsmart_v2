import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.microsoftId;
      },
    },


    phone: {
      type: String,
      trim: true,
        required: function () {
        return !this.googleId && !this.microsoftId;
      },

    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    preferences: {
      type: [String],
      default: [],
      enum: ["1 BHK", "2 BHK", "3 BHK", "Villa", "Studio", "Commercial"],
    },

    // Notification preferences
    emailNotifications: {
      type: Boolean,
      default: true,
    },

    smsNotifications: {
      type: Boolean,
      default: true,
    },

    whatsappNotifications: {
      type: Boolean,
      default: false,
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },


    microsoftId: {
      type: String,
      sparse: true,
      unique: true,
    },

    savedProperties: {
      type: [String],
      default: [],
    },

    recentlyViewed: {
      type: [String],
      default: [],
    },

    contactAccess: {
      monthlyEmailReveals: {
        type: Number,
        default: 0,
      },

      monthlyEmailResetAt: {
        type: Date,
        default: Date.now,
      },

      totalPhoneReveals: {
        type: Number,
        default: 0,
      },

      unlockedListings: {
        type: [String], // listing ids
        default: [],
      },
    },

    premiumMember: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpiry: Date,

    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },

    deletedAt: {
      type: Date,
      default: null,
    },

  },


  { timestamps: true }
);

/* HASH PASSWORD */
userSchema.methods.hashPassword = async function () {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
};

/* COMPARE PASSWORD */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/* VIRTUAL for full name */
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

/* Ensure virtuals are included in JSON */
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model("User", userSchema);