const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (safe if keys missing — will error on actual upload)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — we manually stream to Cloudinary
// This gives us full control and avoids peer-dep issues with cloudinary v2
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (videos)
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

module.exports = {
  uploadImage,
  uploadVideo,
  uploadTalentMedia,
  uploadToCloudinary,
  cloudinary,
};

