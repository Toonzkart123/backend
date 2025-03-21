// // middleware/upload.js
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("cloudinary").v2;
// require("dotenv").config();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dco22xvey",
//   api_key: process.env.CLOUDINARY_API_KEY || "252976365554162",
//   api_secret: process.env.CLOUDINARY_API_SECRET || "jEgVw7Hu44MP9QklJP89-1c2nyA",
// });

// // Set up Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "mern_app", // You can organize uploads into folders
//     allowed_formats: ["jpg", "jpeg", "png", "gif"],
//     transformation: [{ width: 1000, crop: "limit" }], // Optional transformations
//   },
// });

// // File filter - Only allow images
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPEG, PNG, and GIF files are allowed"), false);
//   }
// };

// const upload = multer({ 
//   storage, 
//   fileFilter, 
//   limits: { fileSize: 2 * 1024 * 1024 } // Limit: 2MB
// });

// module.exports = upload;




// middleware/upload.js
const multer = require("multer");
const { storage } = require('../config/cloudinary'); // Import storage from our config

// Optional file filter to allow only specific image MIME types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and GIF files are allowed"), false);
  }
};

// Create the Multer upload middleware using our Cloudinary storage
const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB file size limit
});

module.exports = upload;