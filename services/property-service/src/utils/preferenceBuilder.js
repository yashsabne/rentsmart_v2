import UserInteraction from "../models/UserInteraction.js";

const topKey = (obj) =>
  Object.keys(obj).sort((a, b) => obj[b] - obj[a])[0] || null;

const bucketPrice = (p) => {
  if (p < 10000) return "0-10k";
  if (p < 25000) return "10k-25k";
  if (p < 50000) return "25k-50k";
  if (p < 100000) return "50k-1L";
  return "1L+";
};

export { bucketPrice };

export const buildUserPreferences = async (userId, jwtUser) => {
  // Layer 1 — explicit from JWT (no extra service call needed)
  const baseCity = jwtUser?.city || null;
  const baseTypes = jwtUser?.preferences || [];  // ["2 BHK", "Villa"]

  // Layer 2 — behavioral from interactions
  const interactions = await UserInteraction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const cityScore = {};
  const typeScore = {};
  const buyOrSellScore = {};
  const bedroomScore = {};
  const priceRangeScore = {};

  for (const i of interactions) {
    const daysAgo = (Date.now() - new Date(i.createdAt)) / 86400000;
    const decay = Math.exp(-0.1 * daysAgo); // fades over ~10 days
    const score = i.weight * decay;

    if (i.city) cityScore[i.city] = (cityScore[i.city] || 0) + score;
    if (i.type) typeScore[i.type] = (typeScore[i.type] || 0) + score;
    if (i.buyOrSell) buyOrSellScore[i.buyOrSell] = (buyOrSellScore[i.buyOrSell] || 0) + score;
    if (i.bedroomCount) bedroomScore[i.bedroomCount] = (bedroomScore[i.bedroomCount] || 0) + score;
    if (i.priceRange) priceRangeScore[i.priceRange] = (priceRangeScore[i.priceRange] || 0) + score;
  }

  return {
    baseCity,
    baseTypes,
    topCity: topKey(cityScore) || baseCity,
    topType: topKey(typeScore),
    topBuyOrSell: topKey(buyOrSellScore),
    topBedrooms: topKey(bedroomScore),
    topPriceRange: topKey(priceRangeScore),
  };
};