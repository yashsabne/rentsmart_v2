// src/config/db.js
import dotenv from "dotenv";
dotenv.config()
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("DB ERROR", error.message);
    process.exit(1);
  }
};

export default connectDB;