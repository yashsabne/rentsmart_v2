import { response } from "express";

const PROPERTY_INTELLIGENCE_URL =
  process.env.PROPERTY_INTELLIGENCE_URL;

const PROPERTY_INTELLIGENCE_API_KEY =
  process.env.PROPERTY_INTELLIGENCE_API_KEY;

export const evaluateListingWithAI = async (listing) => {
  if (!PROPERTY_INTELLIGENCE_URL || !PROPERTY_INTELLIGENCE_API_KEY) {
    throw new Error("Property Intelligence service configuration is missing");
  }

  const payload = {
    propertyId: String(listing._id),

    title: listing.title,
    description: listing.description,
    price: Number(listing.price),

    buyOrSell: listing.buyOrSell,
    type: listing.type,

    address: listing.address?.toObject
      ? listing.address.toObject()
      : listing.address,

    details: listing.details?.toObject
      ? listing.details.toObject()
      : listing.details,

    amenities: listing.amenities || [],

    listingPhotos: listing.listingPhotos || []
  };

  const response = await fetch(
    `${PROPERTY_INTELLIGENCE_URL.replace(/\/+$/, "")}/api/evaluations/complete`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-service-key": PROPERTY_INTELLIGENCE_API_KEY
      },


      body: JSON.stringify(payload),
 
      signal: AbortSignal.timeout(60000)
    }
  );
  

  const result = await response.json().catch(() => null);

  console.log(result,'ai evaluate')

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.error ||
      `AI service returned HTTP ${response.status}`
    );
  }

  if (!result?.success) {
    throw new Error("AI service did not complete the evaluation");
  }

  return result;
};
