import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Activity DB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;