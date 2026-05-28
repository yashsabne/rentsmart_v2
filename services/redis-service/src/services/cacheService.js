import { getRedisClient } from "../config/redis.js";
import { keys } from "../utils/redisKeys.js";

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL) || 3600;

export const setCache = async (identifier, data, ttl = DEFAULT_TTL) => {
  const client = getRedisClient();
  const key = keys.cache(identifier);
  await client.set(key, JSON.stringify(data), "EX", ttl);
};

export const getCache = async (identifier) => {
  const client = getRedisClient();
  const key = keys.cache(identifier);
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteCache = async (identifier) => {
  const client = getRedisClient();
  const key = keys.cache(identifier);
  await client.del(key);
};

export const flushCacheByPattern = async (pattern) => {
  const client = getRedisClient();
  const matchPattern = keys.cache(pattern);
  const matchedKeys = await client.keys(matchPattern);
  if (matchedKeys.length > 0) {
    await client.del(...matchedKeys);
  }
  return matchedKeys.length;
};
