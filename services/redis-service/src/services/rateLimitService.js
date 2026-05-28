import { getRedisClient } from "../config/redis.js";
import { keys } from "../utils/redisKeys.js";

const RATE_LIMIT_TTL = parseInt(process.env.RATE_LIMIT_TTL) || 60;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;

export const checkRateLimit = async (identifier, max = RATE_LIMIT_MAX, ttl = RATE_LIMIT_TTL) => {
  const client = getRedisClient();
  const key = keys.rateLimit(identifier);

  const current = await client.incr(key);

  if (current === 1) {
    await client.expire(key, ttl);
  }

  const remaining = max - current;
  const allowed = current <= max;

  return {
    allowed,
    current,
    remaining: Math.max(0, remaining),
    max,
    ttl,
  };
};

export const getRateLimitStatus = async (identifier) => {
  const client = getRedisClient();
  const key = keys.rateLimit(identifier);
  const current = parseInt(await client.get(key)) || 0;
  const ttl = await client.ttl(key);
  return { current, ttl };
};

export const resetRateLimit = async (identifier) => {
  const client = getRedisClient();
  const key = keys.rateLimit(identifier);
  await client.del(key);
};
