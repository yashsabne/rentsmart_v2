import "dotenv/config";
import redis from "./src/config/redis.js";

try {
  const result = await redis.ping();
  console.log("Redis PING:", result);
} catch (error) {
  console.error("Redis test failed:", error.message);
} finally {
  await redis.quit();
}