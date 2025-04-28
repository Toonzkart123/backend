const express = require("express");
const {
  addStationery,
  getAllStationery,
  getStationeryById,
  updateStationery,
  deleteStationery,
} = require("../controllers/adminStationeryController");

const { authenticateAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// 🔹 Add a New Stationery Item (Admin Only)
router.post("/", authenticateAdmin, upload.single("image"), addStationery);

// 🔹 Fetch All Stationery Items (Admin Only)
router.get("/", authenticateAdmin, getAllStationery);

// 🔹 Fetch a Single Stationery Item by ID (Admin Only)
router.get("/:id", authenticateAdmin, getStationeryById);

// 🔹 Update a Stationery Item (Admin Only)
router.put("/:id", authenticateAdmin, upload.single("image"), updateStationery);

// 🔹 Delete a Stationery Item (Admin Only)
router.delete("/:id", authenticateAdmin, deleteStationery);

module.exports = router;
