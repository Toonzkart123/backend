// routes/bulkRoutes.js
const express = require('express');
const multer = require('multer');
const bulkUploads = require('../controllers/bulkUploadsBhavya');

const router = express.Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload/stationery', upload.single('file'), bulkUploads.uploadStationery);

// Route to handle bulk upload of stores
router.post('/upload/stores', upload.single('file'), bulkUploads.uploadStores);

module.exports = router;