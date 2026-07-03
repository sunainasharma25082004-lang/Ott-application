const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Profile name is required"],
      trim: true,
      maxlength: 30,
    },
    avatar: {
      type: String,
      default: "https://i.pravatar.cc/300",
    },
    isKids: {
      type: Boolean,
      default: false,
    },
    // Optional 4-digit pin for kids profile
    pin: {
      type: String,
      select: false,
    },
    // Simple preferences
    preferences: {
      favoriteGenres: [String],
      language: { type: String, default: "en" },
    },
    lastWatched: [
      {
        contentId: { type: mongoose.Schema.Types.ObjectId },
        contentType: { type: String, enum: ["Movie", "Series"] },
        progress: Number, // in seconds
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Ensure one user can't have duplicate profile names (case insensitive)
profileSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Profile", profileSchema);
