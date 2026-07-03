const mongoose = require("mongoose");

const talentSchema = new mongoose.Schema(
  {
    // Can be submitted by logged in user or guest
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Talent name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Actor",
        "Actress",
        "Singer",
        "Dancer",
        "Musician",
        "Comedian",
        "Model",
        "Other",
      ],
      default: "Actor",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: String,
    // Media
    auditionVideo: {
      type: String, // Cloudinary video url
      required: true,
    },
    thumbnail: {
      type: String, // Cloudinary image
    },
    // Social proof
    votes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "featured", "rejected"],
      default: "pending",
    },
    // Admin can feature on homepage
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// For leaderboard sorting
talentSchema.index({ votes: -1, createdAt: -1 });

module.exports = mongoose.model("Talent", talentSchema);
