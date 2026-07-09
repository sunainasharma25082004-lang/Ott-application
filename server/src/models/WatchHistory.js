const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["Movie", "Series", "Episode"],
      required: true,
    },
    progress: {
      type: Number, // seconds watched
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// For "Continue Watching" queries
watchHistorySchema.index({ user: 1, lastWatchedAt: -1 });
// Prevent duplicate entries per user+content
watchHistorySchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
