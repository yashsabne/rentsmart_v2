import Activity from "../models/ActivityModel.js";
import { redisPost, redisGet } from "../utils/redisClient.js";

export const createActivity = async (req, res) => {
  try {
    const { userId, type, meta } = req.body;

    const activity = await Activity.create({ userId, type, meta });

    await redisPost("/cache/flush", { pattern: `activity:${userId}*` });

    return res.status(201).json({ success: true, activity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Number(req.query.limit) || 10;

    const cacheKey = `activity:${userId}:limit:${limit}`;

    const cached = await redisGet(`/cache/${encodeURIComponent(cacheKey)}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json({ success: true, activities: cached.data });
    }

    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    await redisPost("/cache", { key: cacheKey, data: activities, ttl: 60 });

    return res.status(200).json({ success: true, activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};