import Listing from "../models/Listings.js";
import cloudinary from "../config/cloudinary.js";
import { logActivity } from "../utils/activityLogger.js";


/* CREATE LISTING */
export const createListing = async (req, res) => {
  try {
 
    const creatorId = req.user.id;

    const {
      type,
      purpose,

      title,
      description,

      address,
      city,
      locality,
      pincode,

      beds,
      baths,
 
      area,
      balconies,
      floors,
      totalFloors,
      furnishing,
      facing,
      propertyAge,
 
      parking,

      amenities,
      price,
      photos,
    } = req.body;

    const newListing = new Listing({
      creatorId,

      // BASIC
      category: type,
      type,
      buyOrSell: purpose,

      // ADDRESS
      address: {
        street: address,
        aptSuite: locality,
        city,
        pincode,
        country: "India",
      },

      // PROPERTY DETAILS
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

        parking: parking || {
          car: 0,
          bike: 0,
        },
      },

      // AMENITIES
      amenities: amenities || [],

      // TEMPORARY IMAGES
      listingPhotos:
        photos?.length > 0
          ? photos.map(
              () =>
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
            )
          : [
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
            ],

      // CONTENT
      title,
      description,

      // HIGHLIGHTS
      highlight: title,
      highlightDesc: description,

      // PRICE
      price,

      // PAYMENT
      paymentType:
        purpose === "Sell" ? "one-time" : "monthly",
    });

    await newListing.save();

    await logActivity(
  creatorId,
  "PROPERTY_CREATED",
  {
    propertyId: newListing._id,
    propertyTitle: newListing.title,
    purpose: newListing.buyOrSell,
    price: newListing.price
  }
);

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
// controllers/listingController.js

export const getFilteredListings = async (req, res) => {
  try {
    const {
      type,
      search,
      minPrice,
      maxPrice,
      propertyType,
      bedrooms,
      bathrooms,
      city,
      furnished,
      parking,
      readyToMove,
      amenities,
      sortBy,
      page = 1,
      limit = 9
    } = req.query;

    const filter = {};

    // BUY / RENT
    if (type) {
      filter.buyOrSell = {
        $regex: type,
        $options: "i"
      };
    }

    // PROPERTY TYPE
    if (propertyType && propertyType !== "All") {
      filter.type = propertyType;
    }

    // SEARCH
    if (
      search &&
      search !== "all" &&
      search !== "undefined"
    ) {
      filter.$or = [
        {
          category: {
            $regex: search,
            $options: "i"
          }
        },
        {
          title: {
            $regex: search,
            $options: "i"
          }
        },
        {
          "address.city": {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    // CITY
    if (city?.trim()) {
      filter["address.city"] = {
        $regex: city,
        $options: "i"
      };
    }

    // PRICE
    filter.price = {};

    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }

    // BEDROOMS
    if (bedrooms && bedrooms !== "Any") {
      if (bedrooms === "4+") {
        filter["details.bedroomCount"] = {
          $gte: 4
        };
      } else {
        filter["details.bedroomCount"] =
          Number(bedrooms);
      }
    }

    // BATHROOMS
    if (bathrooms && bathrooms !== "Any") {
      if (bathrooms === "4+") {
        filter["details.bathroomCount"] = {
          $gte: 4
        };
      } else {
        filter["details.bathroomCount"] =
          Number(bathrooms);
      }
    }

    // FURNISHED
    if (furnished === "true") {
      filter["details.furnished"] = true;
    }

    // PARKING
    if (parking === "true") {
      filter["details.parking"] = true;
    }

    // READY TO MOVE
    if (readyToMove === "true") {
      filter.status = "ready";
    }

    // AMENITIES
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities)
        ? amenities
        : [amenities];

      filter.amenities = {
        $all: amenitiesArray
      };
    }

    // SORTING
    let sortObject = {
      promoted: -1,
      createdAt: -1
    };

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

    // PAGINATION
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const skip = (pageNum - 1) * limitNum;

    // QUERY
    const [listings, totalCount] =
      await Promise.all([
        Listing.find(filter)
          .sort(sortObject)
          .skip(skip)
          .limit(limitNum),

        Listing.countDocuments(filter)
      ]);

    // RESPONSE
    res.status(200).json({
      listings,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(
        totalCount / limitNum
      ),
      pageSize: limitNum
    });

  } catch (err) {
    console.error(
      "FILTER ERROR:",
      err
    );

    res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};
// Keep your existing searchListings for backward compatibility if needed
export const searchListings = async (req, res) => {
  try {
    const { search, type } = req.query;
    let filter = {};

    if (type) {
      filter.buyOrSell = new RegExp(type, "i");
    }

    if (search && search !== "all") {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } }
      ];
    }

    const listings = await Listing.find(filter).sort({ promoted: -1 });
    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
};


/* GET SINGLE LISTING */
export const getListingById = async (req, res) => {
  try {

    const listing = await Listing.findById(req.params.id);

   
    if (!listing) {
      return res.status(404).json({
        message: "Listing not found"
      });
    }

    res.status(200).json(listing);

  } catch (err) {

    res.status(500).json({
      message: "Error fetching listing"
    });

  }
};

/* UPDATE LISTING */
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await logActivity(
  req.user.id,
  "PROPERTY_UPDATED",
  {
    propertyId: updated._id,
    propertyTitle: updated.title
  }
);

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* DELETE LISTING */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    await logActivity(
  req.user.id,
  "PROPERTY_DELETED",
  {
    propertyTitle
  }
);

    res.json({ message: "Listing deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};


export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      creatorId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching listings" });
  }
};
 
export const getRecommended = async (req, res) => {
  try {
    const { city, preferences, limit = 10 } = req.query;

    const prefArray = preferences
      ? preferences.split(",").map(p => p.trim())
      : [];

    const query = {};
 
    if (city) {
      const cityArray = city.split(",").map(c => c.trim());

      query["address.city"] = {
        $in: cityArray.map(c => new RegExp(c, "i"))
      };
    }
 
    if (prefArray.length > 0) {
      query["$or"] = [
        { type: { $in: prefArray } },
        { category: { $in: prefArray } },
        { title: { $in: prefArray.map(p => new RegExp(p, "i")) } },
      ];
    }

    const properties = await Listing.find(query)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json(properties);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};