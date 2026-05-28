import SavedProperty from "../models/SavedProperty.js";
import Listing from "../models/Listings.js";
import { logActivity } from "../utils/activityLogger.js";
import { redisPost, redisGet, redisDelete } from "../utils/redisClient.js";

const invalidateSavedCache = async (userId) => {
  await Promise.all([
    redisDelete(`/cache/saved:ids:${userId}`),
    redisDelete(`/cache/saved:properties:${userId}`),
  ]);
};

export const toggleSavedProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const listing = await Listing.findById(propertyId);

    const existing = await SavedProperty.findOne({ userId, propertyId });

    if (existing) {
      await existing.deleteOne();

      await invalidateSavedCache(userId);

      await logActivity(userId, "PROPERTY_UNSAVED", {
        propertyId,
        propertyTitle: listing?.title || "Property",
      });

      return res.status(200).json({ success: true, saved: false });
    }

    await SavedProperty.create({ userId, propertyId });

    await invalidateSavedCache(userId);

    await logActivity(userId, "PROPERTY_SAVED", {
      propertyId,
      propertyTitle: listing?.title || "Property",
    });

    return res.status(201).json({ success: true, saved: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ success: true, saved: true });
    }

    console.error(err);

    return res.status(500).json({ success: false, message: "Failed" });
  }
};

export const getSavedIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const cached = await redisGet(`/cache/saved:ids:${userId}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json({ success: true, savedIds: cached.data });
    }

    const saved = await SavedProperty.find({ userId });
    const savedIds = saved.map((item) => item.propertyId);

    await redisPost("/cache", {
      key: `saved:ids:${userId}`,
      data: savedIds,
      ttl: 120,
    });

    res.status(200).json({ success: true, savedIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getSavedProperties = async (req, res) => {
  try {
    const userId = req.user.id;

    const cached = await redisGet(`/cache/saved:properties:${userId}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json({ success: true, properties: cached.data });
    }

    const saved = await SavedProperty.find({ userId });
    const ids = saved.map((item) => item.propertyId);

    const properties = await Listing.find({ _id: { $in: ids } });

    await redisPost("/cache", {
      key: `saved:properties:${userId}`,
      data: properties,
      ttl: 120,
    });

    res.status(200).json({ success: true, properties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};