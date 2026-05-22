import Activity from "../models/ActivityModel.js";

export const createActivity = async (
  req,
  res
) => {
  try {
    const {
      userId,
      type,
      meta,
    } = req.body;

    const activity =
      await Activity.create({
        userId,
        type,
        meta,
      });

    return res.status(201).json({
      success: true,
      activity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActivities = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const limit =
      Number(req.query.limit) || 10;

    const activities =
      await Activity.find({
        userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(limit);

    return res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};