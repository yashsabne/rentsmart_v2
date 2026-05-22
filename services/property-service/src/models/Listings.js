import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    buyOrSell: { //buy or rent
      type: String,
      required: true,
    },

    address: {
      street: String,
      aptSuite: String,
      city: String,
      pincode: Number,
      country: String,
    },

    details: {
      guestCount: Number,
      bedroomCount: Number,
      bedCount: Number,
      bathroomCount: Number,

      area: Number,
      balconyCount: Number,
      floorNumber: Number,
      totalFloors: Number,

      furnishing: String,
      facing: String,

      propertyAge: Number,

      parking: {
        car: Number,
        bike: Number,
      },
    },

    amenities: [String],

    listingPhotos: [String],

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    highlight: {
      type: String,
      required: true,
    },

    highlightDesc: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    paymentType: {
      type: String,
    },
    negotiable: {
      type: Boolean,
      default: false,
    },

    promoted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**listingSchema.index({ city: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ category: 1 });
 */

export default mongoose.model("Listing", listingSchema);