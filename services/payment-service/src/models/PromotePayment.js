import mongoose from "mongoose";

const promotePaymentSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  listingId:{
    type:String,
    required:true
  },

  propertyTitle:{
    type:String,
    required:true
  },

  amount:{
    type:Number,
    default:39
  },

  razorpayOrderId:{
    type:String,
    required:true
  },

  razorpayPaymentId:{
    type:String,
    default:null
  },

  status:{
    type:String,
    enum:["pending","paid","failed"],
    default:"pending"
  },

  promotedAt:{
    type:Date
  },

  expiresAt:{
    type:Date
  }

},{timestamps:true});

export default mongoose.model(
  "PromotePayment",
  promotePaymentSchema
);