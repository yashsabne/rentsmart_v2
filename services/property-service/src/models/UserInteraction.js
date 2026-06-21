import mongoose from "mongoose";

const userInteractionSchema = new mongoose.Schema({
  userId: { type: String, required: true },      
  propertyId: { type: String, required: true },
 
  city: String,
  type: String,
  buyOrSell: String,
  category: String,
  bedroomCount: Number,
  priceRange: String,    

  action: {
    type: String,
    enum: ["VIEW", "SAVE", "CONTACT", "SHARE"],
    required: true,
  },

  weight: { type: Number },

}, { timestamps: true });

userInteractionSchema.pre("save", function () {
  const weights = { VIEW: 1, SAVE: 3, CONTACT: 5, SHARE: 2 };
  this.weight = weights[this.action];
});

userInteractionSchema.index({ userId: 1, createdAt: -1 });
userInteractionSchema.index({ userId: 1, city: 1 });

export default mongoose.model("UserInteraction", userInteractionSchema);