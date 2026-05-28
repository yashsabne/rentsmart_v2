import { setCache, getCache, deleteCache, flushCacheByPattern } from "../services/cacheService.js";
import { setSession, getSession, deleteSession, refreshSession, blacklistToken, isTokenBlacklisted } from "../services/sessionService.js";
import { storeOtp, getOtp, verifyOtp, deleteOtp, getOtpTtl } from "../services/otpService.js";
import { checkRateLimit, getRateLimitStatus, resetRateLimit } from "../services/rateLimitService.js";
import { enqueue, dequeue, peekQueue, getQueueLength, clearQueue } from "../services/queueService.js";
import { publish } from "../services/pubsubService.js";

export const setCacheHandler = async (req, res) => {
  try {
    const { key, data, ttl } = req.body;

    if (!key || data === undefined) {
      return res.status(400).json({ success: false, message: "key and data are required" });
    }

    await setCache(key, data, ttl);

    res.status(200).json({ success: true, message: "Cache set successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCacheHandler = async (req, res) => {
  try {
    const { key } = req.params;
    const data = await getCache(key);

    if (data === null) {
      return res.status(404).json({ success: false, message: "Cache miss" });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteCacheHandler = async (req, res) => {
  try {
    const { key } = req.params;
    await deleteCache(key);
    res.status(200).json({ success: true, message: "Cache deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const flushCacheHandler = async (req, res) => {
  try {
    const { pattern } = req.body;

    if (!pattern) {
      return res.status(400).json({ success: false, message: "pattern is required" });
    }

    const count = await flushCacheByPattern(pattern);
    res.status(200).json({ success: true, message: `Flushed ${count} keys` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const setSessionHandler = async (req, res) => {
  try {
    const { userId, sessionData, ttl } = req.body;

    if (!userId || !sessionData) {
      return res.status(400).json({ success: false, message: "userId and sessionData are required" });
    }

    await setSession(userId, sessionData, ttl);
    res.status(200).json({ success: true, message: "Session stored" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSessionHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const session = await getSession(userId);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.status(200).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteSessionHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteSession(userId);
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const refreshSessionHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ttl } = req.body;
    await refreshSession(userId, ttl);
    res.status(200).json({ success: true, message: "Session refreshed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const blacklistTokenHandler = async (req, res) => {
  try {
    const { token, ttl } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "token is required" });
    }

    await blacklistToken(token, ttl);
    res.status(200).json({ success: true, message: "Token blacklisted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const checkTokenBlacklistHandler = async (req, res) => {
  try {
    const { token } = req.params;
    const blacklisted = await isTokenBlacklisted(token);
    res.status(200).json({ success: true, blacklisted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const storeOtpHandler = async (req, res) => {
  try {
    const { target, otp, ttl } = req.body;

    if (!target || !otp) {
      return res.status(400).json({ success: false, message: "target and otp are required" });
    }

    await storeOtp(target, otp, ttl);
    res.status(200).json({ success: true, message: "OTP stored" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyOtpHandler = async (req, res) => {
  try {
    const { target, otp } = req.body;

    if (!target || !otp) {
      return res.status(400).json({ success: false, message: "target and otp are required" });
    }

    const valid = await verifyOtp(target, otp);

    if (!valid) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getOtpTtlHandler = async (req, res) => {
  try {
    const { target } = req.params;
    const ttl = await getOtpTtl(target);
    res.status(200).json({ success: true, ttl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteOtpHandler = async (req, res) => {
  try {
    const { target } = req.params;
    await deleteOtp(target);
    res.status(200).json({ success: true, message: "OTP deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const checkRateLimitHandler = async (req, res) => {
  try {
    const { identifier, max, ttl } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, message: "identifier is required" });
    }

    const result = await checkRateLimit(identifier, max, ttl);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRateLimitStatusHandler = async (req, res) => {
  try {
    const { identifier } = req.params;
    const status = await getRateLimitStatus(identifier);
    res.status(200).json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const resetRateLimitHandler = async (req, res) => {
  try {
    const { identifier } = req.params;
    await resetRateLimit(identifier);
    res.status(200).json({ success: true, message: "Rate limit reset" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const enqueueHandler = async (req, res) => {
  try {
    const { queueName, job } = req.body;

    if (!queueName || !job) {
      return res.status(400).json({ success: false, message: "queueName and job are required" });
    }

    await enqueue(queueName, job);
    res.status(200).json({ success: true, message: "Job enqueued" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const dequeueHandler = async (req, res) => {
  try {
    const { queueName } = req.params;
    const job = await dequeue(queueName);

    if (!job) {
      return res.status(404).json({ success: false, message: "Queue is empty" });
    }

    res.status(200).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const peekQueueHandler = async (req, res) => {
  try {
    const { queueName } = req.params;
    const { count } = req.query;
    const jobs = await peekQueue(queueName, count ? parseInt(count) : 10);
    res.status(200).json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getQueueLengthHandler = async (req, res) => {
  try {
    const { queueName } = req.params;
    const length = await getQueueLength(queueName);
    res.status(200).json({ success: true, length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const clearQueueHandler = async (req, res) => {
  try {
    const { queueName } = req.params;
    await clearQueue(queueName);
    res.status(200).json({ success: true, message: "Queue cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const publishHandler = async (req, res) => {
  try {
    const { channel, payload } = req.body;

    if (!channel || !payload) {
      return res.status(400).json({ success: false, message: "channel and payload are required" });
    }

    await publish(channel, payload);
    res.status(200).json({ success: true, message: `Published to ${channel}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
