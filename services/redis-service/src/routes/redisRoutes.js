import express from "express";
const router = express.Router();

import {
  setCacheHandler,
  getCacheHandler,
  deleteCacheHandler,
  flushCacheHandler,
  setSessionHandler,
  getSessionHandler,
  deleteSessionHandler,
  refreshSessionHandler,
  blacklistTokenHandler,
  checkTokenBlacklistHandler,
  storeOtpHandler,
  verifyOtpHandler,
  getOtpTtlHandler,
  deleteOtpHandler,
  checkRateLimitHandler,
  getRateLimitStatusHandler,
  resetRateLimitHandler,
  enqueueHandler,
  dequeueHandler,
  peekQueueHandler,
  getQueueLengthHandler,
  clearQueueHandler,
  publishHandler,
} from "../controllers/redisController.js";

router.post("/cache", setCacheHandler);
router.get("/cache/:key", getCacheHandler);
router.delete("/cache/:key", deleteCacheHandler);
router.post("/cache/flush", flushCacheHandler);

router.post("/session", setSessionHandler);
router.get("/session/:userId", getSessionHandler);
router.delete("/session/:userId", deleteSessionHandler);
router.patch("/session/:userId/refresh", refreshSessionHandler);

router.post("/token/blacklist", blacklistTokenHandler);
router.get("/token/blacklist/:token", checkTokenBlacklistHandler);

router.post("/otp", storeOtpHandler);
router.post("/otp/verify", verifyOtpHandler);
router.get("/otp/:target/ttl", getOtpTtlHandler);
router.delete("/otp/:target", deleteOtpHandler);

router.post("/rate-limit/check", checkRateLimitHandler);
router.get("/rate-limit/:identifier", getRateLimitStatusHandler);
router.delete("/rate-limit/:identifier", resetRateLimitHandler);

router.post("/queue/enqueue", enqueueHandler);
router.get("/queue/:queueName/dequeue", dequeueHandler);
router.get("/queue/:queueName/peek", peekQueueHandler);
router.get("/queue/:queueName/length", getQueueLengthHandler);
router.delete("/queue/:queueName", clearQueueHandler);

router.post("/pubsub/publish", publishHandler);

export default router;
