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
    deposit: {
      type: Number,
      default: null,
    },

    maintenance: {
      type: Number,
      default: null,
    },

    available: {
      type: Date,
      default: null,
    },
    negotiable: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },

    hiddenAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "RENTED", "SOLD", "DELETED"],
      default: "AVAILABLE",
    },

    statusChangedAt: {
      type: Date,
      default: null,
    },

    lastRefreshedAt: {
      type: Date,
      default: Date.now,
    },

    refreshCount: {
      type: Number,
      default: 0,
    },

    isPromoted: { type: Boolean, default: false },
    promotedUntil: { type: Date, default: null },
    promotedPaymentId: { type: String, default: null },

    rankScore: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ "address.city": 1 });

listingSchema.index({ price: 1 });

listingSchema.index({ category: 1 });

listingSchema.index({ buyOrSell: 1 });

listingSchema.index({
  isHidden: 1,
  status: 1,
  rankScore: -1,
});

listingSchema.index({
  isHidden: 1,
  status: 1,
  buyOrSell: 1,
  price: 1,
});

listingSchema.index({
  isHidden: 1,
  status: 1,
  buyOrSell: 1,
  lastRefreshedAt: -1,
});

listingSchema.index({
  isHidden: 1,
  status: 1,
  buyOrSell: 1,
  createdAt: -1,
});

export default mongoose.model("Listing", listingSchema);