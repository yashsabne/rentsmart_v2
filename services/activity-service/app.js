import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./src/config/db.js";
import activityRoutes from "./src/routes/activityRoutes.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/test", (req, res) => {
  res.send("activity runn");
});


app.use("/api/activities", activityRoutes);

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Activity Service running on port ${PORT}`);
});