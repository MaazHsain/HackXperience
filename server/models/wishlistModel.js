import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "group",
        required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "item",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    buyAsGroup: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        }
    ],
    requestToBuy: {
      type: mongoose.Schema.Types.ObjectId, // One user requesting to buy
      ref: "user",
      default: null,
    }
  });
  
  const wishlistModel = mongoose.models.wishlist || mongoose.model("wishlist", wishlistSchema);
  export default wishlistModel;
