import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectRedis from "./src/config/redis.js";
import redisRoutes from "./src/routes/redisRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectRedis();

app.get("/test", (req, res) => {
  res.send("Redis Service Running ");
});

app.use("/api/redis", redisRoutes);

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
