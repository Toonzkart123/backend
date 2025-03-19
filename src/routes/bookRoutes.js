// routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const { addBook, getBooksBySchool, getBooksBySubject, getBookById, getAllBooks, getAllBookNames } = require('../controllers/bookController');
const { authenticateAdmin } = require('../middleware/authMiddleware')

router.get("/book-names", getAllBookNames);

// Protected (Admin) - Add a new book
router.post("/", authenticateAdmin, addBook);

// Shop by School
router.get('/school/:schoolName', getBooksBySchool);

// Shop by Subject
router.get('/subject/:subjectName', getBooksBySubject);

// Single book details (optional)
router.get('/:id', getBookById);

// General books listing or search (e.g., for "Shop on Demand" or general searches)
router.get('/', getAllBooks)

module.exports = router;
