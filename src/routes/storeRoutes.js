const express = require("express");
const { registerStore, loginStore } = require("../controllers/storeController");

const router = express.Router();

// Store Registration
router.post("/register", registerStore);

// Store Login
router.post("/login", loginStore);

module.exports = router;
