const express = require("express");
const router = express.Router();
const { registerStore, loginStore, getStoresBySchoolId, getStoresByBookId, addSchoolToStore, removeSchoolFromStore,} = require("../controllers/storeController");
const { getStoreById } = require("../controllers/adminStoreController");


// Store Registration
router.post("/register", registerStore);

// Store Login
router.post("/login", loginStore);


// Existing Route (already implemented)
router.get('/school/:schoolId', getStoresBySchoolId);

// ✅ New Routes (implement these)
router.put('/:storeId/add-school', addSchoolToStore);

router.put('/:storeId/remove-school', removeSchoolFromStore);

// 🔹 Fetch store by ID
router.get("/:id",  getStoreById);

router.get("/by-book/:bookId", getStoresByBookId);

module.exports = router;
