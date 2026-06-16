import Listing from "../models/Listings.js";
import { redisDelete } from "../utils/redisClient.js";
 
const REFRESH_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

export const toggleHideListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await Listing.findOne({ _id: id, creatorId: userId });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    console.log("BEFORE:", listing.isHidden);  // ← add
    const nowHidden = !listing.isHidden;
    listing.isHidden = nowHidden;
    listing.hiddenAt = nowHidden ? new Date() : null;
    await listing.save();
    await redisDelete(`/cache/listing:${listing._id}`);

    return res.status(200).json({ success: true, listing });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const refreshListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await Listing.findOne({ _id: id, creatorId: userId });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.lastRefreshedAt) {
      const elapsed = Date.now() - new Date(listing.lastRefreshedAt).getTime();
      if (elapsed < REFRESH_COOLDOWN_MS) {
        const remainingMs = REFRESH_COOLDOWN_MS - elapsed;
        return res.status(429).json({
          message: "Cooldown active",
          remainingMs,
          nextRefreshAt: new Date(Date.now() + remainingMs).toISOString(),
        });
      }
    }

    listing.lastRefreshedAt = new Date();
    listing.refreshCount = (listing.refreshCount || 0) + 1;
    await listing.save();
    await redisDelete(`/cache/listing:${listing._id}`);


    return res.status(200).json({ success: true, listing });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ["AVAILABLE", "RENTED", "SOLD"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const listing = await Listing.findOne({ _id: id, creatorId: userId });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = status;
    listing.statusChangedAt = new Date();
    await listing.save();
    await redisDelete(`/cache/listing:${listing._id}`);


    return res.status(200).json({ success: true, listing });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const pipeline = [
      { $match: { creatorId: userId } },
      {
        $facet: {
          listings: [{ $sort: { createdAt: -1 } }],
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                availableCount: {
                  $sum: { $cond: [{ $and: [{ $eq: ["$status", "AVAILABLE"] }, { $eq: ["$isHidden", false] }] }, 1, 0] },
                },
                hiddenCount: {
                  $sum: { $cond: [{ $eq: ["$isHidden", true] }, 1, 0] },
                },
                rentedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "RENTED"] }, 1, 0] },
                },
                soldCount: {
                  $sum: { $cond: [{ $eq: ["$status", "SOLD"] }, 1, 0] },
                },
                promotedCount: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ["$isPromoted", true] }, { $gt: ["$promotedUntil", new Date()] }] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          listings: 1,
          counts: { $arrayElemAt: ["$counts", 0] },
        },
      },
    ];

    const [result] = await Listing.aggregate(pipeline);
    const counts = result?.counts || {
      total: 0, availableCount: 0, hiddenCount: 0,
      rentedCount: 0, soldCount: 0, promotedCount: 0,
    };

    return res.status(200).json({
      success: true,
      listings: result?.listings || [],
      counts,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};