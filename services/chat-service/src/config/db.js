const mongoose = require("mongoose");
 
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[chat-service] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[chat-service] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;