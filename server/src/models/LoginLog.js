const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // may be null for unregistered emails
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "otp_required"],
      required: true,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    reason: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index to optimize querying login logs by email or user, ordered by timestamp
loginLogSchema.index({ email: 1, timestamp: -1 });
loginLogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model("LoginLog", loginLogSchema);
