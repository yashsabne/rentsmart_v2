import Listing from "../models/Listings.js";
import { cloudinary } from "../config/cloudinary.js";
import { logActivity } from "../utils/activityLogger.js";
import { redisPost, redisGet, redisDelete } from "../utils/redisClient.js";
import { POPULAR_LOCATIONS } from "../../const/popularCities.js";

const buildFilterCacheKey = (query) => {
  const {
    type, search, minPrice, maxPrice, propertyType,
    bedrooms, bathrooms, city, furnished, parking,
    readyToMove, amenities, sortBy, page = 1, limit = 15,
  } = query;

  return [
    "listings:filtered",
    type || "",
    search || "",
    minPrice || "",
    maxPrice || "",
    propertyType || "",
    bedrooms || "",
    bathrooms || "",
    city || "",
    furnished || "",
    parking || "",
    readyToMove || "",
    Array.isArray(amenities) ? amenities.join(",") : amenities || "",
    sortBy || "",
    page,
    limit,
  ].join(":");
};

export const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const urls = req.files.map((file) => file.path);

    return res.status(200).json({
      success: true,
      urls,
    });
  } catch (err) {
    console.error("UPLOAD PHOTOS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Photo upload failed",
    });
  }
};

export const createListing = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const {
      type, purpose, title, description,
      address, city, locality, pincode,
      beds, baths, area, balconies, floors, totalFloors,
      furnishing, facing, propertyAge, parking,
      amenities, price, photos,
      deposit, maintenance, available, negotiable,
    } = req.body;

    const newListing = new Listing({
      creatorId,
      category: type,
      type,
      buyOrSell: purpose,
      address: {
        street: address,
        aptSuite: locality,
        city,
        pincode,
        country: "India",
      },
      details: {
        guestCount: beds,
        bedroomCount: beds,
        bedCount: beds,
        bathroomCount: baths,
        area,
        balconyCount: balconies,
        floorNumber: floors,
        totalFloors,
        furnishing,
        facing,
        propertyAge,
        parking: parking || { car: 0, bike: 0 },
      },
      amenities: amenities || [],
      listingPhotos: Array.isArray(photos) && photos.length > 0 ? photos : [],
      title,
      description,
      highlight: title,
      highlightDesc: description,
      price,
      deposit: deposit || null,
      maintenance: maintenance || null,
      available: available || null,
      negotiable: negotiable || false,
      paymentType: purpose === "Sell" ? "one-time" : "monthly",
    });

    await newListing.save();

    await Promise.all([
      redisPost("/cache/flush", { pattern: "listings:filtered*" }),
      redisPost("/cache/flush", { pattern: `listings:my:${creatorId}*` }),
      redisPost("/cache/flush", { pattern: "listings:recommended*" }),
    ]);

    await logActivity(creatorId, "PROPERTY_CREATED", {
      propertyId: newListing._id,
      propertyTitle: newListing.title,
      purpose: newListing.buyOrSell,
      price: newListing.price,
    });

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing: newListing,
    });
  } catch (err) {
    console.error("CREATE LISTING ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create listing",
      error: err.message,
    });
  }
};

export const getFilteredListings = async (req, res) => {
  try {
    const cacheKey = buildFilterCacheKey(req.query);
    const cached = await redisGet(`/cache/${encodeURIComponent(cacheKey)}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json(cached.data);
    }

    const {
      type, search, minPrice, maxPrice, propertyType,
      bedrooms, bathrooms, city, furnished,
      parking, amenities, sortBy,
      page = 1, limit = 20,
    } = req.query;

    const now = new Date();

    const filter = {
      isHidden: false,
      status: "AVAILABLE",
    };

    const hasCitySearch = city?.trim();
    const hasTextSearch = search && search !== "all" && search !== "undefined";

    if (type) filter.buyOrSell = { $regex: `^${type}$`, $options: "i" };
    if (propertyType && propertyType !== "All") filter.type = propertyType;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (bedrooms && bedrooms !== "Any")
      filter["details.bedroomCount"] = bedrooms === "4+" ? { $gte: 4 } : Number(bedrooms);

    if (bathrooms && bathrooms !== "Any")
      filter["details.bathroomCount"] = bathrooms === "4+" ? { $gte: 4 } : Number(bathrooms);

    if (furnished === "true")
      filter["details.furnishing"] = { $exists: true, $nin: ["Unfurnished", "", null] };

    if (parking === "true") {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { "details.parking.car": { $gt: 0 } },
          { "details.parking.bike": { $gt: 0 } },
        ],
      });
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = { $all: amenitiesArray };
    }

    const promotedSort = {
      $cond: {
        if: { $and: [{ $eq: ["$isPromoted", true] }, { $gt: ["$promotedUntil", now] }] },
        then: 1,
        else: 0,
      },
    };

    let baseSortStage;

    switch (sortBy) {
      case "Price: Low–High":
        baseSortStage = { $sort: { _promoted: -1, price: 1 } };
        break;
      case "Price: High–Low":
        baseSortStage = { $sort: { _promoted: -1, price: -1 } };
        break;
      case "Newest First":
        baseSortStage = { $sort: { _promoted: -1, createdAt: -1 } };
        break;
      default:
        baseSortStage = { $sort: { _promoted: -1, lastRefreshedAt: -1, createdAt: -1 } };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const addFieldsStage = { $addFields: { _promoted: promotedSort } };

    let listings = [];
    let totalCount = 0;

    if (hasCitySearch || hasTextSearch) {
      const query = city?.trim() || search?.trim() || "";
      const sortedCities = [...POPULAR_LOCATIONS].sort((a, b) => b.length - a.length);
      const detectedCity = sortedCities.find(c =>
        query.toLowerCase().includes(c.toLowerCase())
      );
      const remainingSearch = detectedCity
        ? query.replace(new RegExp(detectedCity, "ig"), "").trim()
        : query;

      if (detectedCity) {
        filter["address.city"] = { $regex: `^${detectedCity}$`, $options: "i" };
      }

      const searchQuery = remainingSearch || detectedCity;

      const pipeline = [
        {
          $search: {
            index: "default",
            compound: {
              should: [
                { text: { query: searchQuery, path: "title", fuzzy: { maxEdits: 2 }, score: { boost: { value: 10 } } } },
                { text: { query: searchQuery, path: "amenities", fuzzy: { maxEdits: 1 }, score: { boost: { value: 8 } } } },
                { text: { query: searchQuery, path: "type", fuzzy: { maxEdits: 1 }, score: { boost: { value: 6 } } } },
                { text: { query: searchQuery, path: "category", fuzzy: { maxEdits: 1 }, score: { boost: { value: 4 } } } },
                { text: { query: searchQuery, path: "description", fuzzy: { maxEdits: 2 }, score: { boost: { value: 1 } } } },
              ],
            },
          },
        },
        { $match: filter },
        addFieldsStage,
        baseSortStage,
        {
          $facet: {
            listings: [{ $skip: skip }, { $limit: limitNum }, { $project: { _promoted: 0 } }],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const result = await Listing.aggregate(pipeline);
      listings = result[0]?.listings || [];
      totalCount = result[0]?.totalCount?.[0]?.count || 0;
    } else {
      const pipeline = [
        { $match: filter },
        addFieldsStage,
        baseSortStage,
        {
          $facet: {
            listings: [{ $skip: skip }, { $limit: limitNum }, { $project: { _promoted: 0 } }],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const result = await Listing.aggregate(pipeline);
      listings = result[0]?.listings || [];
      totalCount = result[0]?.totalCount?.[0]?.count || 0;
    }

    const responseData = {
      listings,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      pageSize: limitNum,
    };

    await redisPost("/cache", { key: cacheKey, data: responseData, ttl: 300 });

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("FILTER ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};


export const getSimilarListings = async (req, res) => {
  try {
    const { category, type, excludeId, cursor, limit = 8 } = req.query;

 
    const query = {
      _id: { $ne: excludeId },
      category,
      buyOrSell: { $regex: `^${type}$`, $options: "i" },
      isHidden: false,
      status: "AVAILABLE",
    };

    if (cursor) {
      query._id = { ...query._id, $lt: cursor };
    }

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1)
      .lean();

    const hasMore = listings.length > Number(limit);
    if (hasMore) listings.pop();

    res.status(200).json({
      listings,
      hasMore,
      nextCursor: hasMore ? listings[listings.length - 1]._id : null,
    });
  } catch (err) { 
    res.status(500).json({ message: "Failed to fetch similar listings" });
  }
};



export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const cached = await redisGet(`/cache/listing:${id}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json(cached.data);
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await redisPost("/cache", {
      key: `listing:${id}`,
      data: listing.toObject(),
      ttl: 600,
    });

    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Error fetching listing" });
  }
};

export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Listing.findByIdAndUpdate(id, req.body, { new: true });

    await Promise.all([
      redisDelete(`/cache/listing:${id}`),
      redisPost("/cache/flush", { pattern: "listings:filtered*" }),
      redisPost("/cache/flush", { pattern: `listings:my:${req.user.id}*` }),
      redisPost("/cache/flush", { pattern: "listings:recommended*" }),
    ]);

    await logActivity(req.user.id, "PROPERTY_UPDATED", {
      propertyId: updated._id,
      propertyTitle: updated.title,
    });

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const propertyTitle = listing.title;
    const creatorId = listing.creatorId;

    await Listing.findByIdAndDelete(id);

    await Promise.all([
      redisDelete(`/cache/listing:${id}`),
      redisPost("/cache/flush", { pattern: "listings:filtered*" }),
      redisPost("/cache/flush", { pattern: `listings:my:${creatorId}*` }),
      redisPost("/cache/flush", { pattern: "listings:recommended*" }),
    ]);

    await logActivity(req.user.id, "PROPERTY_DELETED", { propertyTitle });

    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getMyListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const cacheKey = `listings:my:${userId}:page:${page}`;
    const cached = await redisGet(`/cache/${encodeURIComponent(cacheKey)}`);

    if (cached?.success && cached?.data) return res.status(200).json(cached.data);

    const [listings, stats] = await Promise.all([
      Listing.find({ creatorId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Listing.aggregate([
        { $match: { creatorId: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ["$isPromoted", 1, 0] } },
            rent: { $sum: { $cond: [{ $eq: [{ $toLower: "$buyOrSell" }, "rent"] }, 1, 0] } },
            buy: { $sum: { $cond: [{ $eq: [{ $toLower: "$buyOrSell" }, "sell"] }, 1, 0] } }
          }
        }
      ])
    ]);

    const statsData = stats[0] || { total: 0, active: 0, rent: 0, buy: 0 };

    const responseData = {
      listings,
      total: statsData.total,
      active: statsData.active,
      rent: statsData.rent,
      buy: statsData.buy,
      hasMore: skip + listings.length < statsData.total,
      currentPage: page
    };

    await redisPost("/cache", { key: cacheKey, data: responseData, ttl: 120 });

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching listings" });
  }
};
export const getRecommended = async (req, res) => {
  try {
    const { city, preferences, limit = 10 } = req.query;

    const cacheKey = `listings:recommended:${city || ""}:${preferences || ""}:${limit}`;

    const cached = await redisGet(`/cache/${encodeURIComponent(cacheKey)}`);
    if (cached?.success && cached?.data) {
      return res.status(200).json(cached.data);
    }

    const prefArray = preferences
      ? preferences.split(",").map((p) => p.trim())
      : [];

    const query = {};

    if (city) {
      const cityArray = city.split(",").map((c) => c.trim());
      query["address.city"] = { $in: cityArray.map((c) => new RegExp(c, "i")) };
    }

    if (prefArray.length > 0) {
      query["$or"] = [
        { type: { $in: prefArray } },
        { category: { $in: prefArray } },
        { title: { $in: prefArray.map((p) => new RegExp(p, "i")) } },
      ];
    }

    const properties = await Listing.find(query)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    await redisPost("/cache", {
      key: cacheKey,
      data: properties,
      ttl: 600,
    });

    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
