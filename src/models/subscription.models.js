import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    // jo subscribe kar raha hai
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // jis channel ko subscribe kiya ja raha hai
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
