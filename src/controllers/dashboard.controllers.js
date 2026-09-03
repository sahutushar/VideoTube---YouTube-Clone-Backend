import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// channel ki overall stats - views, subscribers, videos, likes
const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const totalSubscribers = await Subscription.countDocuments({ channel: userId });

  const videoStats = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$likes" } },
      },
    },
  ]);

  const stats = {
    totalSubscribers,
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalLikes: videoStats[0]?.totalLikes || 0,
  };

  return res.status(200).json(new ApiResponse(200, stats, "Channel stats mil gayi"));
});

// channel ki saari videos
const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user?._id) } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: { likesCount: { $size: "$likes" } },
    },
    { $sort: { createdAt: -1 } },
    { $project: { title: 1, thumbnail: 1, views: 1, isPublished: 1, likesCount: 1, createdAt: 1 } },
  ]);

  return res.status(200).json(new ApiResponse(200, videos, "Channel videos mil gayi"));
});

export { getChannelStats, getChannelVideos };
