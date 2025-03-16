const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/authMiddleware");
const {
  getAllBookRequests,
  getBookRequestById,
  updateBookRequest,
  deleteBookRequest
} = require("../controllers/adminBookRequestController");

// 📌 **Admin fetches all book requests**
router.get("/", authenticateAdmin, getAllBookRequests);

// 📌 **Admin fetches a specific request by ID**
router.get("/:id", authenticateAdmin, getBookRequestById);

// 📌 **Admin updates a request status**
router.put("/:id", authenticateAdmin, updateBookRequest);

// 📌 **Admin deletes a request**
router.delete("/:id", authenticateAdmin, deleteBookRequest);

module.exports = router;
