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
      books,
      phoneNumber,
      schoolName,    // optional
      studentName,   // optional
    } = req.body;

    // Since we no longer require the user to be logged in, remove userId references
    // const userId = req.user._id;  // remove this if not needed

    if (!books || books.length === 0) {
      return res.status(400).json({ message: "Book list cannot be empty" });
    }

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Create the request without referencing any user ID
    const request = new BookRequest({
      // user: userId, // remove if not needed
      books,
      phoneNumber,
      schoolName,    // optional field
      studentName,   // optional field
      status: "Pending",
    });

    await request.save();
    res
      .status(201)
      .json({ message: "Request submitted successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
