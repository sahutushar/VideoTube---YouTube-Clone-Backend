import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// video like/unlike toggle karo
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID sahi nahi hai");
  }

  const existingLike = await Like.findOne({ video: videoId, likedBy: req.user?._id });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like hata diya"));
  }

  await Like.create({ video: videoId, likedBy: req.user?._id });
  return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Like kar diya"));
});

// comment like/unlike toggle karo
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID sahi nahi hai");
  }

  const existingLike = await Like.findOne({ comment: commentId, likedBy: req.user?._id });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Comment like hata diya"));
  }

  await Like.create({ comment: commentId, likedBy: req.user?._id });
  return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Comment like kar diya"));
});

// tweet like/unlike toggle karo
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet ID sahi nahi hai");
  }

  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Tweet like hata diya"));
  }

  await Like.create({ tweet: tweetId, likedBy: req.user?._id });
  return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Tweet like kar diya"));
});

// user ne jo videos like ki hain unki list
const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    { $match: { likedBy: new mongoose.Types.ObjectId(req.user?._id), video: { $exists: true } } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{ $project: { username: 1, avatar: 1 } }],
            },
          },
          { $unwind: "$owner" },
        ],
      },
    },
    { $unwind: "$videoDetails" },
    { $match: { "videoDetails.isPublished": true } },
    { $project: { videoDetails: 1 } },
  ]);

  return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos mil gayi"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
