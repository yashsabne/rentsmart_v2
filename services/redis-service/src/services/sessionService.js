import { getRedisClient } from "../config/redis.js";
import { keys } from "../utils/redisKeys.js";

const SESSION_TTL = parseInt(process.env.SESSION_TTL) || 86400;

export const setSession = async (userId, sessionData, ttl = SESSION_TTL) => {
  const client = getRedisClient();
  const key = keys.session(userId);
  await client.set(key, JSON.stringify(sessionData), "EX", ttl);
};

export const getSession = async (userId) => {
  const client = getRedisClient();
  const key = keys.session(userId);
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteSession = async (userId) => {
  const client = getRedisClient();
  const key = keys.session(userId);
  await client.del(key);
};

export const refreshSession = async (userId, ttl = SESSION_TTL) => {
  const client = getRedisClient();
  const key = keys.session(userId);
  await client.expire(key, ttl);
};

export const blacklistToken = async (token, ttl = SESSION_TTL) => {
  const client = getRedisClient();
  const key = keys.tokenBlacklist(token);
  await client.set(key, "1", "EX", ttl);
};

export const isTokenBlacklisted = async (token) => {
  const client = getRedisClient();
  const key = keys.tokenBlacklist(token);
  const result = await client.get(key);
  return result !== null;
};
