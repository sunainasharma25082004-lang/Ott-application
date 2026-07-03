require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const hpp = require("hpp");
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const connectDB = require("./src/configs/Database");
const { getConnectionStatus } = require("./src/configs/Database");
const errorHandler = require("./src/middlewares/errorHandler");
const { apiLimiter } = require("./src/middlewares/rateLimiter");

// Connect to MongoDB (non-blocking - server starts even if DB is down)
connectDB().catch(() => {});

const app = express();

// ==================== SECURITY & PRODUCTION MIDDLEWARE ====================

// Helmet - sets secure HTTP headers
app.use(helmet());

// Prevent HTTP Parameter Pollution attacks
app.use(hpp());

// Body parsers (with reasonable limits)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS configuration for Expo, web, and physical devices
const corsOrigin = process.env.CORS_ORIGIN || "*";
const isDev = process.env.NODE_ENV !== "production";
app.use(
  cors({
    // In dev allow everything (including RN emulator requests that may send no/ null Origin).
    // In prod use the explicit list from .env
    origin: isDev ? true : (corsOrigin.includes(",") ? corsOrigin.split(",") : corsOrigin),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ==================== ROUTES ====================

// Health checks (unlimited)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Talent Hunt API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
  });
});

// Detailed status for debugging network issues from client
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    server: "Talent Hunt API",
    port: PORT,
    dbConnected: getConnectionStatus(),
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    message: getConnectionStatus()
      ? "Database connected. All good."
      : "Database NOT connected. Most API calls (auth, movies, profiles...) will fail until you fix MONGO_URI in server/.env",
    tip: "Test this URL from your phone/emulator browser to confirm network reachability.",
  });
});

// Simple ping that never touches the database (good for connectivity test)
app.get("/api/ping", (req, res) => {
  res.json({
    success: true,
    message: "pong",
    serverTime: new Date().toISOString(),
    note: "This endpoint works even without MongoDB.",
  });
});

// Apply general rate limiting to all API routes
app.use("/api", apiLimiter);

// API Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/profiles", require("./src/routes/profileRoutes"));
app.use("/api/movies", require("./src/routes/movieRoutes"));
app.use("/api/series", require("./src/routes/seriesRoutes"));
app.use("/api/talent", require("./src/routes/talentRoutes"));
app.use("/api/wishlist", require("./src/routes/wishlistRoutes"));
app.use("/api/search", require("./src/routes/searchRoutes"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`🎬 Talent Hunt Backend (Production Ready)`);
  console.log(`========================================`);
  console.log(`🌐 Server listening on 0.0.0.0:${PORT} (all interfaces)`);
  console.log(`🔗 From this PC (web/iOS sim):   http://localhost:${PORT}`);
  console.log(`📱 Android Emulator:             http://10.0.2.2:${PORT}`);
  console.log(`📱 Physical phone (same WiFi):   http://YOUR_PC_IP:${PORT}`);
  console.log(`   👉 Find YOUR_PC_IP by running in PowerShell: ipconfig`);
  console.log(`========================================\n`);
  console.log(`\nQuick tests (open these in browser from the device you're testing on):`);
  console.log(`  • Status (shows DB state):    http://localhost:${PORT}/api/status   (or 10.0.2.2 on Android emu)`);
  console.log(`  • Ping (no DB needed):        http://localhost:${PORT}/api/ping`);
  console.log(`  • If dbConnected: false → you MUST put a real MongoDB URI in server/.env\n`);
});

// Graceful shutdown
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});
