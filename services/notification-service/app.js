import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import notificationRoutes from "./src/routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/notify", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Notification Service Running");
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`🚀 Notification Service on ${PORT}`);
});