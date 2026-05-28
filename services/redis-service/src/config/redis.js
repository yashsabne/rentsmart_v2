import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config()

let redisClient;
 
const connectRedis = () => {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });


  redisClient.on("connect", () => { 
    console.log("Redis Connected Successfully");
    console.log("HOST:", process.env.REDIS_HOST || "redis");
    console.log("PORT:", process.env.REDIS_PORT || 6379);
  });

  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  redisClient.on("disconnected", () => {
    console.log("Redis disconnected");
  });

  redisClient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
  });

  return redisClient;
};

export const getRedisClient = () => redisClient;

export default connectRedis;
