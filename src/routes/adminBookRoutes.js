const express = require("express");
const { addBook, getAllBooks, updateBook, getBookById, deleteBook } = require("../controllers/adminBookController");
const { authenticateAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// 🔹 Add a New Book (Admin Only)
router.post("/", authenticateAdmin, upload.single("image"), addBook);

// 🔹 Fetch all books (Admin Only)
router.get("/", authenticateAdmin, getAllBooks);

// 🔹 Fetch a single book by ID (Admin Only)
router.get("/:id", authenticateAdmin, getBookById);

// 🔹 Update book details (Admin Only)
router.put("/:id", authenticateAdmin, upload.single("image"), updateBook);

// 🔹 Delete a Book (Admin Only)
router.delete("/:id", authenticateAdmin, deleteBook);

module.exports = router;
