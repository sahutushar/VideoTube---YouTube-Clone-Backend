import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    // kis video ko like/dislike kiya
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    // kis comment ko like kiya
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    // kis tweet ko like kiya
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    // kisne like kiya
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
