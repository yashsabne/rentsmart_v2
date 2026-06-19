import Listings from "../models/Listings.js";
import SavedProperty from "../models/SavedProperty.js";

export function computeRankScore(listing, savedCount = 0) {
  const now = Date.now();
  let score = 0;

  if (listing.isPromoted && listing.promotedUntil > now) score += 1000;

  const daysSinceRefresh = (now - new Date(listing.lastRefreshedAt).getTime()) / 86400000;
  score += Math.max(0, 100 - daysSinceRefresh * (100 / 30)); // fades to 0 over 30 days

  score += Math.min((listing.listingPhotos?.length || 0) * 4, 20);
  if ((listing.description?.length || 0) > 50) score += 10;

  let filled = 0;
  if (listing.details?.furnishing) filled++;
  if (listing.details?.facing) filled++;
  if (listing.amenities?.length) filled++;
  if (listing.details?.parking?.car || listing.details?.parking?.bike) filled++;
  score += filled * 5;

  score += Math.min(savedCount * 3, 30);
  score += Math.min((listing.viewCount || 0) * 1, 50);

  return Math.round(score);
}

export async function recalculateRankScore(listingId) {
  const listing = await Listings.findById(listingId);
  if (!listing) return;
  const savedCount = await SavedProperty.countDocuments({ propertyId: listingId });
  listing.rankScore = computeRankScore(listing, savedCount);
  await listing.save();
}

