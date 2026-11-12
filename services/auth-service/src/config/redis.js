import "dotenv/config";
import Redis from "ioredis";

const redisUrl = process.env.BULLMQ_REDIS_URL;

if (!redisUrl) {
  throw new Error("[AUTH] BULLMQ_REDIS_URL is missing");
}

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  console.log("[AUTH] BullMQ Redis connected");
});

redis.on("error", (error) => {
  console.error("[AUTH] Redis error:", error.message);
});

export default redis;