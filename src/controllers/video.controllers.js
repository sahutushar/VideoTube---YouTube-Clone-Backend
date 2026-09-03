import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// saari videos lo - search, sort, pagination ke saath
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

  const pipeline = [];

  // search karo title ya description mein
  if (query) {
    pipeline.push({
      $search: {
        index: "search-videos",
        text: { query, path: ["title", "description"] },
      },
    });
  }

  // sirf published videos dikhao
  pipeline.push({ $match: { isPublished: true } });

  // agar specific user ki videos chahiye
  if (userId) {
    pipeline.push({ $match: { owner: new mongoose.Types.ObjectId(userId) } });
  }

  // sort karo
  pipeline.push({ $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } });

  // owner ki basic details bhi lao
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "ownerDetails",
      pipeline: [{ $project: { username: 1, avatar: 1 } }],
    },
  });
  pipeline.push({ $unwind: "$ownerDetails" });

  const options = { page: parseInt(page), limit: parseInt(limit) };
  const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

  return res.status(200).json(new ApiResponse(200, videos, "Videos mil gayi"));
});

// naya video upload karo
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title aur description required hain");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) throw new ApiError(400, "Video file required hai");
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail required hai");

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) throw new ApiError(500, "Video upload nahi hua");
  if (!thumbnail) throw new ApiError(500, "Thumbnail upload nahi hua");

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user?._id,
  });

  return res.status(201).json(new ApiResponse(201, video, "Video publish ho gayi"));
});

// ek video ki details lo
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID sahi nahi hai");
  }

  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      // likes count karo
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      // owner ki details lao
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          { $project: { username: 1, avatar: 1, subscribersCount: 1, isSubscribed: 1 } },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        owner: { $first: "$owner" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1, thumbnail: 1, title: 1, description: 1,
        views: 1, createdAt: 1, duration: 1, owner: 1, likesCount: 1, isLiked: 1,
      },
    },
  ]);

  if (!video?.length) {
    throw new ApiError(404, "Video nahi mili");
  }

  // views badhao aur watch history mein add karo
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
  await User.findByIdAndUpdate(req.user?._id, { $addToSet: { watchHistory: videoId } });

  return res.status(200).json(new ApiResponse(200, video[0], "Video mil gayi"));
});

// video ki details update karo
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID sahi nahi hai");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video nahi mili");

  // sirf owner hi update kar sakta hai
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf video ka owner update kar sakta hai");
  }

  let thumbnailUrl = video.thumbnail;
  if (req.file?.path) {
    const thumbnail = await uploadOnCloudinary(req.file.path);
    if (!thumbnail) throw new ApiError(500, "Thumbnail upload nahi hua");
    // purani thumbnail delete karo
    const oldPublicId = video.thumbnail.split("/").pop().split(".")[0];
    await deleteFromCloudinary(oldPublicId);
    thumbnailUrl = thumbnail.url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { title, description, thumbnail: thumbnailUrl } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedVideo, "Video update ho gayi"));
});

// video delete karo
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID sahi nahi hai");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video nahi mili");

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf video ka owner delete kar sakta hai");
  }

  await Video.findByIdAndDelete(videoId);

  return res.status(200).json(new ApiResponse(200, {}, "Video delete ho gayi"));
});

// video publish/unpublish toggle karo
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID sahi nahi hai");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video nahi mili");

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf video ka owner status change kar sakta hai");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: !video.isPublished } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedVideo, "Publish status change ho gaya"));
});

export { getAllVideos, publishVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
