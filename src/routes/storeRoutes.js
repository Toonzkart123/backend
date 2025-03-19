const express = require("express");
const { registerStore, loginStore, getStoresBySchoolId, getStoresByBookId } = require("../controllers/storeController");
const { getStoreById } = require("../controllers/adminStoreController");

const router = express.Router();

// Store Registration
router.post("/register", registerStore);

// Store Login
router.post("/login", loginStore);


// Fetch stores by school ID
router.get("/school/:schoolId", getStoresBySchoolId);

// 🔹 Fetch store by ID
router.get("/:id",  getStoreById);

router.get("/by-book/:bookId", getStoresByBookId);

module.exports = router;
