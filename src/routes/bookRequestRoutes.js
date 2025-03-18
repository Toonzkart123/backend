const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const { submitBookRequest } = require("../controllers/bookRequestController");

// 📌 **User submits a book request**
router.post("/", authenticateUser, submitBookRequest);

module.exports = router;
