import mongoose from "mongoose";

const savedPropertySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    propertyId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

savedPropertySchema.index(
  { userId: 1, propertyId: 1 },
  { unique: true }
);

export default mongoose.model("SavedProperty",savedPropertySchema);