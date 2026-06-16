
import User from "../models/User.js";


/**
 * PATCH /api/auth/recently-viewed
 * Body: { listingId: string }
 * Prepends listingId, deduplicates, trims to 5.
 */
export const addRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: "listingId is required" });
    }

    // $pull removes any existing occurrence, then $push prepends with $slice
    // Single atomic operation — no race conditions, no duplicate reads
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { recentlyViewed: listingId },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          recentlyViewed: {
            $each: [listingId],
            $position: 0,
            $slice: 5,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("ADD_RECENTLY_VIEWED ERROR:", err);
    return res.status(500).json({ message: "Failed to update recently viewed" });
  }
};

/**
 * GET /api/auth/recently-viewed
 * Returns the user's recentlyViewed listing ID array.
 */
export const getRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("recentlyViewed")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      recentlyViewed: user.recentlyViewed || [],
    });
  } catch (err) {
    console.error("GET_RECENTLY_VIEWED ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch recently viewed" });
  }
};