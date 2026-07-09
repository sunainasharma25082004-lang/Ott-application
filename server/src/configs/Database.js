const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn("⚠️  MONGO_URI not set in .env — running without database (most routes will fail).");
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // fail fast in dev
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.error("❌ MongoDB Connection Error:", error.message);
    console.warn("⚠️  Server will start but database-dependent features will not work.");
    console.warn("   Update MONGO_URI in server/.env with a real MongoDB (Atlas or local) and restart.");
    // Do NOT exit — allow server to run for health checks and development
  }
};

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️  MongoDB disconnected");
});

module.exports = connectDB;
module.exports.getConnectionStatus = () => mongoose.connection.readyState === 1;
