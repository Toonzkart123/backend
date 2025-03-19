// routes/publicStationeryRoutes.js
const express = require("express");
const { getAllStationery } = require("../controllers/adminStationeryController");
// ^ We’re just reusing the same function

const router = express.Router();

// Public route: fetch all stationery, no authentication
router.get("/", getAllStationery);

module.exports = router;
