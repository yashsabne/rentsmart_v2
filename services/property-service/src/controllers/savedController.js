// controllers/savedController.js

import SavedProperty from "../models/SavedProperty.js";
import Listing from "../models/Listings.js";
import { logActivity } from "../utils/activityLogger.js";


// SAVE / UNSAVE
export const toggleSavedProperty = async (req, res) => {
  try {

    const userId = req.user.id;
    const { propertyId } = req.params;

    const listing = await Listing.findById(
      propertyId
    );

    const existing =
      await SavedProperty.findOne({
        userId,
        propertyId,
      });

    // UNSAVE
    if (existing) {

      await existing.deleteOne();

      await logActivity(
        userId,
        "PROPERTY_UNSAVED",
        {
          propertyId,
          propertyTitle:
            listing?.title || "Property",
        }
      );

      return res.status(200).json({
        success: true,
        saved: false,
      });
    }

    // SAVE
    await SavedProperty.create({
      userId,
      propertyId,
    });

    await logActivity(
      userId,
      "PROPERTY_SAVED",
      {
        propertyId,
        propertyTitle:
          listing?.title || "Property",
      }
    );

    return res.status(201).json({
      success: true,
      saved: true,
    });

  } catch (err) {

    // duplicate save protection
    if (err.code === 11000) {
      return res.status(200).json({
        success: true,
        saved: true,
      });
    }

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed",
    });
  }
};

export const getSavedIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const saved =
      await SavedProperty.find({ userId });

    const savedIds = saved.map(
      (item) => item.propertyId
    );

    res.status(200).json({
      success: true,
      savedIds,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};


export const getSavedProperties =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const saved =
        await SavedProperty.find({
          userId,
        });

      const ids = saved.map(
        (item) => item.propertyId
      );

      const properties =
        await Listing.find({
          _id: { $in: ids },
        });

      res.status(200).json({
        success: true,
        properties,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
      });
    }
  };