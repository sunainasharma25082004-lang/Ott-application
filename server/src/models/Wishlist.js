const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Can reference Movie or Series
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["Movie", "Series"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate wishlist entries per user
wishlistSchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
