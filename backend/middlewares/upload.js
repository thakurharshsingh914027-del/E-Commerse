const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// --- THE CONSTRUCTOR FIX ---
// This line checks if it's a named export or a default export
const StorageEngine = CloudinaryStorage || require("multer-storage-cloudinary");

const storage = new StorageEngine({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "gif", "avif"],
    transformation: [{ width: 800, height: 800, crop: "limit" }]
  },
});

const upload = multer({ storage });

module.exports = upload;
// const multer = require("multer");
// const cloudinary = require("../config/cloudinary");

// // --- UNIVERSAL IMPORT FIX ---
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// // If the above is undefined, we try the default export
// const StorageConstructor = CloudinaryStorage || require("multer-storage-cloudinary").CloudinaryStorage || require("multer-storage-cloudinary");

// const storage = new StorageConstructor({
//   cloudinary: cloudinary,
//   params: {
//     folder: "products",
//     allowed_formats: ["jpg", "png", "jpeg", "webp", "gif","avif"],
//     transformation: [{ width: 800, height: 800, crop: "limit" }]
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;



