const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String, // vertical/poster style
      required: true,
    },
    poster: {
      type: String, // wide hero image
    },
    videoUrl: {
      type: String, // main playable url (mp4 or hls later)
    },
    trailerUrl: {
      type: String, // optional short trailer/preview
    },
    duration: {
      type: Number, // minutes
      default: 120,
    },
    genres: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 7.5,
    },
    releaseYear: {
      type: Number,
    },
    language: {
      type: String,
      default: "English",
    },
    cast: [
      {
        name: String,
        image: String,
        character: String,
      },
    ],
    isTrending: {
      type: Boolean,
      default: false,
    },
    isNewRelease: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    isDummy: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
