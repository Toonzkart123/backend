const express = require("express");
const { registerStore, loginStore, getStoresBySchoolId } = require("../controllers/storeController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Store Registration
router.post("/register", registerStore);

// Store Login
router.post("/login", loginStore);


// Fetch stores by school ID
router.get("/school/:schoolId", authenticateUser, getStoresBySchoolId);

module.exports = router;
