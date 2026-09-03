import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// channel subscribe/unsubscribe toggle karo
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel ID sahi nahi hai");
  }

  if (channelId === req.user?._id.toString()) {
    throw new ApiError(400, "Apne aap ko subscribe nahi kar sakte");
  }

  const existingSub = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });

  if (existingSub) {
    await Subscription.findByIdAndDelete(existingSub._id);
    return res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribe ho gaya"));
  }

  await Subscription.create({ subscriber: req.user?._id, channel: channelId });
  return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "Subscribe ho gaya"));
});

// channel ke subscribers ki list
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel ID sahi nahi hai");
  }

  const subscribers = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [{ $project: { username: 1, avatar: 1, fullname: 1 } }],
      },
    },
    { $unwind: "$subscriber" },
    { $project: { subscriber: 1 } },
  ]);

  return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers mil gaye"));
});

// user ne kaunse channels subscribe kiye hain
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "videos",
            },
          },
          {
            $addFields: { latestVideo: { $last: "$videos" } },
          },
          { $project: { username: 1, avatar: 1, fullname: 1, latestVideo: 1 } },
        ],
      },
    },
    { $unwind: "$channel" },
    { $project: { channel: 1 } },
  ]);

  return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels mil gaye"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
