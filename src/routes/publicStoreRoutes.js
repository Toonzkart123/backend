// routes/publicStoreRoutes.js
const express = require("express");
const { getAllStores } = require("../controllers/adminStoreController");

const router = express.Router();

/**
 * Public route (no admin authentication needed)
 * GET /api/public/stores
 * Returns all stores
 */
router.get("/", getAllStores);

module.exports = router;
