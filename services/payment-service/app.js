// app.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./src/config/db.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";

dotenv.config();

const app = express();

connectDB();
 
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://rentsmart-v2.vercel.app/"
  ],
  credentials: true
}));

app.use(express.json());

app.use(
  "/api/payment",
  paymentRoutes
);

app.get("/", (req, res) => {
  res.send("Payment Service Running");
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(` Server running on ${PORT}`);
});