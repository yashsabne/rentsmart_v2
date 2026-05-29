import mongoose from "mongoose";

const connectDB = async () => {
  try {

    console.log("ENV URI:", process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI);
 
    console.log("Mongo Connected Successfully");
  

    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to:", mongoose.connection.name);
    });

    mongoose.connection.on("error", (err) => {
      console.log("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected");
    });

  } catch (error) {
    console.error("DB CONNECTION ERROR:", error);
    process.exit(1);
  }
};

export default connectDB;