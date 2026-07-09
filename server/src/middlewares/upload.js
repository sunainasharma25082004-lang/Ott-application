const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (safe if keys missing — will error on actual upload)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// True only when all three Cloudinary keys are present.
const isCloudinaryConfigured = () =>
  !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_CLOUD_NAME.includes("dummy") &&
    !process.env.CLOUDINARY_API_SECRET.includes("dummy")
  );

// Local uploads directory (served statically at /uploads by server.js).
const UPLOADS_ROOT = path.join(__dirname, "..", "..", "uploads");

// Use memory storage — we manually stream to Cloudinary
// This gives us full control and avoids peer-dep issues with cloudinary v2
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1000 * 1024 * 1024, // 1GB max (videos)
  },
});

// Single image upload (profile pic, thumbnail, poster)
const uploadImage = upload.single("image");

// Single video upload
const uploadVideo = upload.single("video");

// For Talent submissions (thumbnail + video together)
const uploadTalentMedia = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "auditionVideo", maxCount: 1 },
]);

// For Movie uploads (main video + optional trailer + thumbnail/poster images)
const uploadMovieMedia = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "trailer", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "poster", maxCount: 1 },
]);

/**
 * Upload a buffer (from multer memory) to Cloudinary
 */
const uploadToCloudinary = (buffer, options = {}) => {
  const {
    folder = "talenthunt",
    resourceType = "auto",
    transformation = {},
  } = options;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...transformation,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Pick a file extension from the uploaded file's name, falling back to its mimetype.
const extFromFile = (file) => {
  const fromName = path.extname(file.originalname || "");
  if (fromName) return fromName.toLowerCase();
  const map = {
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/webm": ".webm",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return map[file.mimetype] || "";
};

// Write a multer memory buffer to server/uploads/<folder>/ and return its public path.
const saveBufferLocally = (file, folder) => {
  const dir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extFromFile(file)}`;
  fs.writeFileSync(path.join(dir, name), file.buffer);
  return `/uploads/${folder}/${name}`; // relative — caller prepends host for absolute URL
};

/**
 * Store an uploaded media file. Uses Cloudinary when it's configured, otherwise
 * falls back to local disk so uploads work out-of-the-box in development.
 * Returns { url, duration } — duration (seconds) is only available from Cloudinary.
 */
const storeMedia = async (file, { folder = "misc", resourceType = "auto", req } = {}) => {
  if (isCloudinaryConfigured()) {
    const result = await uploadToCloudinary(file.buffer, { folder, resourceType });
    return { url: result.secure_url, duration: result.duration || null };
  }
  const relativePath = saveBufferLocally(file, folder);
  const base = req ? `${req.protocol}://${req.get("host")}` : "";
  return { url: `${base}${relativePath}`, duration: null };
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadTalentMedia,
  uploadMovieMedia,
  uploadToCloudinary,
  storeMedia,
  isCloudinaryConfigured,
  cloudinary,
};

