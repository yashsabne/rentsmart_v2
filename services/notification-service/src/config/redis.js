import Redis from "ioredis";

const redis = new Redis(process.env.BULLMQ_REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  console.log("BullMQ Redis connected");
});

redis.on("error", (err) => {
  console.error("BullMQ Redis error:", err.message);
});

export default redis;