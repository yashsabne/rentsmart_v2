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
      page = 1, limit = 15,
    } = req.query;

    const filter = {};

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
          { "details.parking.bike": { $gt: 0 } }
        ]
      });
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = { $all: amenitiesArray };
    }

    let sortObject = { promoted: -1, createdAt: -1 };

    switch (sortBy) {
      case "Price: Low–High":
        sortObject = { price: 1 };
        break;
      case "Price: High–Low":
        sortObject = { price: -1 };
        break;
      case "Newest First":
        sortObject = { createdAt: -1 };
        break;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let listings = [];
    let totalCount = 0;

    if (hasCitySearch || hasTextSearch) {

      const query = city?.trim() || search?.trim() || "";

      const sortedCities = [...POPULAR_LOCATIONS].sort(
        (a, b) => b.length - a.length
      );

      const detectedCity = sortedCities.find(c =>
        query.toLowerCase().includes(c.toLowerCase())
      );

      const remainingSearch = detectedCity
        ? query.replace(new RegExp(detectedCity, "ig"), "").trim()
        : query;

      if (detectedCity) {
        filter["address.city"] = {
          $regex: `^${detectedCity}$`,
          $options: "i"
        };
      }

      const searchQuery = remainingSearch || detectedCity;

 

      const pipeline = [
        {
          $search: {
            index: "default",
            compound: {
              should: [
                {
                  text: {
                    query: searchQuery,
                    path: "title",
                    fuzzy: { maxEdits: 2 },
                    score: { boost: { value: 10 } }
                  }
                },
                {
                  text: {
                    query: searchQuery,
                    path: "amenities",
                    fuzzy: { maxEdits: 1 },
                    score: { boost: { value: 8 } }
                  }
                },
                {
                  text: {
                    query: searchQuery,
                    path: "type",
                    fuzzy: { maxEdits: 1 },
                    score: { boost: { value: 6 } }
                  }
                },
                {
                  text: {
                    query: searchQuery,
                    path: "category",
                    fuzzy: { maxEdits: 1 },
                    score: { boost: { value: 4 } }
                  }
                },
                {
                  text: {
                    query: searchQuery,
                    path: "description",
                    fuzzy: { maxEdits: 2 },
                    score: { boost: { value: 1 } }
                  }
                }
              ]
            }
          }
        },
        { $match: filter },
        { $sort: sortObject },
        {
          $facet: {
            listings: [{ $skip: skip }, { $limit: limitNum }],
            totalCount: [{ $count: "count" }]
          }
        }
      ];

      const result = await Listing.aggregate(pipeline);

      listings = result[0]?.listings || [];
      totalCount = result[0]?.totalCount?.[0]?.count || 0;
    } else {
      [listings, totalCount] = await Promise.all([
        Listing.find(filter).sort(sortObject).skip(skip).limit(limitNum),
        Listing.countDocuments(filter),
      ]);
    }

    const responseData = {
      listings,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      pageSize: limitNum,
    };

    await redisPost("/cache", {
      key: cacheKey,
      data: responseData,
      ttl: 300,
    });

    return res.status(200).json(responseData);

  } catch (err) {
    console.error("FILTER ERROR:", err);
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};

export const searchListings = async (req, res) => {
  try {
    const { search, type } = req.query;

    const pipeline = [];

    if (search?.trim()) {
      pipeline.push({
        $search: {
          index: "default",
          compound: {
            should: [
              {
                text: {
                  query: search,
                  path: [
                    "title",
                    "description",
                    "category",
                    "amenities",
                    "type"
                  ],
                  fuzzy: {
                    maxEdits: 2
                  }
                }
              },
              {
                autocomplete: {
                  query: search,
                  path: "address.city",
                  fuzzy: {
                    maxEdits: 2
                  }
                }
              }
            ]
          }
        }
      });

      pipeline.push({
        $addFields: {
          score: {
            $meta: "searchScore"
          }
        }
      });
    }

    if (type) {
      pipeline.push({
        $match: {
          buyOrSell: {
            $regex: `^${type}$`,
            $options: "i"
          }
        }
      });
    }

    pipeline.push({
      $sort: {
        score: -1,
        promoted: -1,
        createdAt: -1
      }
    });

    const listings = await Listing.aggregate(pipeline);

    res.status(200).json(listings);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Search failed"
    });
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
    if (cached?.success && cached?.data) {
      return res.status(200).json(cached.data);
    }

    const [listings, total] = await Promise.all([
      Listing.find({ creatorId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Listing.countDocuments({ creatorId: userId }),
    ]);

    const responseData = {
      listings,
      total,
      hasMore: skip + listings.length < total,
      currentPage: page,
    };

    await redisPost("/cache", {
      key: cacheKey,
      data: responseData,
      ttl: 120,
    });

    res.json(responseData);
  } catch (err) {
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
