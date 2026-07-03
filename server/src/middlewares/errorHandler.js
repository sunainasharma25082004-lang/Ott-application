// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack || err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // No database connection (common when using dummy MONGO_URI)
  if (
    err.message?.includes('buffering timed out') ||
    err.message?.includes('not connected') ||
    err.name === 'MongooseServerSelectionError' ||
    err.message?.includes('ECONNREFUSED')
  ) {
    statusCode = 503;
    message = "Database not connected. Please put a real MONGO_URI in server/.env and restart the backend.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
