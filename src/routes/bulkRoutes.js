// routes/bulkRoutes.js
const express = require('express');
const multer = require('multer');
const bulkUploads = require('../controllers/bulkUploads');

const router = express.Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define routes for bulk uploads
router.post('/upload/books', upload.single('file'), bulkUploads.uploadBooks);


module.exports = router;

