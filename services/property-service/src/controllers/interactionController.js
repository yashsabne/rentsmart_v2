import UserInteraction from "../models/UserInteraction.js";
import Listing from "../models/Listings.js";
import { redisDelete } from "../utils/redisClient.js";
import { bucketPrice } from "../utils/preferenceBuilder.js";

export const trackInteraction = async (req, res) => { 
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(200).json({ success: true });

    const { propertyId, action } = req.body;

    const listing = await Listing.findById(propertyId)
      .select("address.city type buyOrSell category details.bedroomCount price")
      .lean();

    if (!listing) return res.status(200).json({ success: true });

    await UserInteraction.create({
      userId,
      propertyId,
      city: listing.address?.city,
      type: listing.type,
      buyOrSell: listing.buyOrSell,
      category: listing.category,
      bedroomCount: listing.details?.bedroomCount,
      priceRange: bucketPrice(listing.price),
      action,
    });
 
    await redisDelete(`/cache/prefs:${userId}`);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Interaction tracking failed:", err);
    return res.status(200).json({ success: true }); // still 200
  }
};