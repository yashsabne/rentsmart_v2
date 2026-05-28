import { getRedisClient } from "../config/redis.js";
import { keys } from "../utils/redisKeys.js";

const OTP_TTL = parseInt(process.env.OTP_TTL) || 300;

export const storeOtp = async (target, otp, ttl = OTP_TTL) => {
  const client = getRedisClient();
  const key = keys.otp(target);
  await client.set(key, otp, "EX", ttl);
};

export const getOtp = async (target) => {
  const client = getRedisClient();
  const key = keys.otp(target);
  return await client.get(key);
};

export const verifyOtp = async (target, otp) => {
  const client = getRedisClient();
  const key = keys.otp(target);
  const stored = await client.get(key);
  if (!stored || stored !== String(otp)) {
    return false;
  }
  await client.del(key);
  return true;
};

export const deleteOtp = async (target) => {
  const client = getRedisClient();
  const key = keys.otp(target);
  await client.del(key);
};

export const getOtpTtl = async (target) => {
  const client = getRedisClient();
  const key = keys.otp(target);
  return await client.ttl(key);
};
