import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// video ke saare comments lo
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID sahi nahi hai");
  }

  const pipeline = [
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    {
      // comment karne wale ki details lao
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, avatar: 1, fullname: 1 } }],
      },
    },
    {
      // likes count karo comment pe
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
        likesCount: { $size: "$likes" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
    { $project: { content: 1, owner: 1, likesCount: 1, isLiked: 1, createdAt: 1 } },
  ];

  const options = { page: parseInt(page), limit: parseInt(limit) };
  const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options);

  return res.status(200).json(new ApiResponse(200, comments, "Comments mil gaye"));
});

// naya comment add karo
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content required hai");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video ID sahi nahi hai");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video nahi mili");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  return res.status(201).json(new ApiResponse(201, comment, "Comment add ho gaya"));
});

// comment update karo
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content required hai");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment nahi mila");

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf comment ka owner update kar sakta hai");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedComment, "Comment update ho gaya"));
});

// comment delete karo
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment nahi mila");

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Sirf comment ka owner delete kar sakta hai");
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json(new ApiResponse(200, {}, "Comment delete ho gaya"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
