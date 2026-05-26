require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
const { socketAuth } = require("./middleware/authMiddleware");
const { registerChatHandlers } = require("./sockets/chatSocket");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);
 
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
 
app.use(express.json());
 
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
 
app.get("/health", (req, res) => res.json({ status: "ok", service: "chat-service" }));

 const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

 io.use(socketAuth);

 io.on("connection", (socket) => {
  registerChatHandlers(io, socket);
});

 const PORT = process.env.PORT || 5005;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[chat-service] Running on port ${PORT}`);
  });
});