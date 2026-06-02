import mongoose from "mongoose";

const connectDB = async () => {
  try {

    const conn = await mongoose.connect(process.env.MONGO_URI);
 
   

    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected ");
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