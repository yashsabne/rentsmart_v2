import { checkRateLimit } from "../services/rateLimitService.js";

const rateLimitMiddleware = (max, ttl) => async (req, res, next) => {
  try {
    const identifier =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.ip;

    const result = await checkRateLimit(identifier, max, ttl);

    res.set("X-RateLimit-Limit", result.max);
    res.set("X-RateLimit-Remaining", result.remaining);
    res.set("X-RateLimit-Window", result.ttl);

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: result.ttl,
      });
    }

    next();
  } catch (err) {
    next();
  }
};

export default rateLimitMiddleware;
