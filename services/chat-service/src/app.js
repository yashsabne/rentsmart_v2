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

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────────────────────
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", service: "chat-service" }));

// ─── SOCKET.IO ────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Authenticate every socket connection with JWT
io.use(socketAuth);

// Register event handlers for each connected socket
io.on("connection", (socket) => {
  registerChatHandlers(io, socket);
});

// ─── START ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5005;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[chat-service] Running on port ${PORT}`);
  });
});