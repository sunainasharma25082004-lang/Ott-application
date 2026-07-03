const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
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
      type: String,
      required: true,
    },
    poster: {
      type: String,
    },
    genres: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 8.0,
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
    numberOfSeasons: {
      type: Number,
      default: 1,
    },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
