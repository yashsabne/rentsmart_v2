// src/config/redis.js
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

let redisClient;

const connectRedis = () => {
  redisClient =
    process.env.VERSION === "development"
      ? new Redis({
          host: process.env.REDIS_HOST || "redis",
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          retryStrategy: (times) => Math.min(times * 50, 2000),
        })
      : new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
 
          keepAlive: 30000,           // send TCP keepalive every 30s
          connectTimeout: 10000,      // fail fast on connect
          commandTimeout: 5000,       // fail fast on commands

          retryStrategy(times) {
            if (times > 20) return null; // stop retrying after 20 attempts
            const delay = Math.min(times * 100, 3000);
            console.log(`Redis retry attempt ${times}, waiting ${delay}ms`);
            return delay;
          },
        });

  redisClient.on("connect", () => console.log("Redis Connected (Upstash)"));
  redisClient.on("error", (err) => console.error("Redis error:", err.message));
  redisClient.on("close", () => console.log("Redis connection closed"));
  redisClient.on("reconnecting", () => console.log("Redis reconnecting..."));
  redisClient.on("ready", () => console.log("Redis ready"));

  return redisClient;
};

export const getRedisClient = () => redisClient;
export default connectRedis;