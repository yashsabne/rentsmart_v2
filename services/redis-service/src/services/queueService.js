import { getRedisClient } from "../config/redis.js";
import { keys } from "../utils/redisKeys.js";

export const enqueue = async (queueName, job) => {
  const client = getRedisClient();
  const key = keys.queue(queueName);
  await client.rpush(key, JSON.stringify(job));
};

export const dequeue = async (queueName) => {
  const client = getRedisClient();
  const key = keys.queue(queueName);
  const item = await client.lpop(key);
  return item ? JSON.parse(item) : null;
};

export const peekQueue = async (queueName, count = 10) => {
  const client = getRedisClient();
  const key = keys.queue(queueName);
  const items = await client.lrange(key, 0, count - 1);
  return items.map((item) => JSON.parse(item));
};

export const getQueueLength = async (queueName) => {
  const client = getRedisClient();
  const key = keys.queue(queueName);
  return await client.llen(key);
};

export const clearQueue = async (queueName) => {
  const client = getRedisClient();
  const key = keys.queue(queueName);
  await client.del(key);
};

export const blockingDequeue = async (queueName, timeout = 0) => {
  const client = getRedisClient();
  const key = keys.queue(queueName);
  const result = await client.blpop(key, timeout);
  if (!result) return null;
  return JSON.parse(result[1]);
};
