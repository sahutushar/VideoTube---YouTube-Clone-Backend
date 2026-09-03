import mongoose from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// naya playlist banao
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Playlist ka naam required hai");
  }

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user?._id,
  });

  return res.status(201).json(new ApiResponse(201, playlist, "Playlist ban gayi"));
});

// user ki saari playlists lo
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "User ID sahi nahi hai");
  }

  const playlists = await Playlist.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalVideos: { $size: "$videos" },
        totalViews: { $sum: "$videos.views" },
      },
    },
    { $project: { name: 1, description: 1, totalVideos: 1, totalViews: 1, updatedAt: 1 } },
  ]);

  return res.status(200).json(new ApiResponse(200, playlists, "Playlists mil gayi"));
});

// playlist ID se playlist lo
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist ID sahi nahi hai");
  }

  const playlist = await Playlist.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          { $match: { isPublished: true } },
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
    {
      $addFields: { totalVideos: { $size: "$videos" }, totalViews: { $sum: "$videos.views" } },
    },
  ]);

  if (!playlist?.length) {
    throw new ApiError(404, "Playlist nahi mili");
  }

  return res.status(200).json(new ApiResponse(200, playlist[0], "Playlist mil gayi"));
});

// playlist mein video add karo
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "ID sahi nahi hai");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist nahi mili");

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf playlist ka owner video add kar sakta hai");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video nahi mili");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video playlist mein add ho gayi"));
});

// playlist se video remove karo
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist nahi mili");

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf playlist ka owner video remove kar sakta hai");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video playlist se remove ho gayi"));
});

// playlist delete karo
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist nahi mili");

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf playlist ka owner delete kar sakta hai");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res.status(200).json(new ApiResponse(200, {}, "Playlist delete ho gayi"));
});

// playlist update karo
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Playlist ka naam required hai");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist nahi mili");

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf playlist ka owner update kar sakta hai");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $set: { name, description } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist update ho gayi"));
});

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist };
