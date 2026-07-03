const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema(
  {
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    seasonNumber: {
      type: Number,
      required: true,
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    duration: {
      type: Number, // minutes
      default: 45,
    },
    releaseDate: Date,
  },
  { timestamps: true }
);

// Unique per season/episode in a series
episodeSchema.index({ series: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model("Episode", episodeSchema);
