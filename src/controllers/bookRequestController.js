// const BookRequest = require("../models/bookRequestModel");

// // ✅ **1. Submit a Book Request (User)**
// exports.submitBookRequest = async (req, res) => {
//   try {
//     const { books, phoneNumber } = req.body;
//     const userId = req.user._id;

//     if (!books || books.length === 0) {
//       return res.status(400).json({ message: "Book list cannot be empty" });
//     }

//     const request = new BookRequest({
//       user: userId,
//       books,
//       phoneNumber,
//       status: "Pending",
//     });

//     await request.save();
//     res.status(201).json({ message: "Request submitted successfully", request });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

const BookRequest = require("../models/bookRequestModel");

// ✅ **1. Submit a Book Request (User or Guest)**
exports.submitBookRequest = async (req, res) => {
  try {
    const {
      books: booksRaw,
      phoneNumber,
      schoolName,
      studentName,
      studentClass,
    } = req.body;

    let books = [];

    // Try parsing book list
    if (booksRaw) {
      try {
        books = JSON.parse(booksRaw); // because FormData sends as string
      } catch (err) {
        return res.status(400).json({ message: "Invalid book list format" });
      }
    }

    const file = req.file;
    const fileUrl = file ? file.path : null;

    if ((!books || books.length === 0) && !fileUrl) {
      return res.status(400).json({
        message: "Please provide either a book list or upload a file",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const request = new BookRequest({
      books,
      phoneNumber,
      schoolName,
      studentClass,
      studentName,
      fileUrl,
      status: "Pending",
    });

    await request.save();

    res
      .status(201)
      .json({ message: "Request submitted successfully", request });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
