const BookRequest = require("../models/bookRequestModel");

// ✅ **1. Submit a Book Request (User)**
exports.submitBookRequest = async (req, res) => {
  try {
    const { books, phoneNumber } = req.body;
    const userId = req.user._id;

    if (!books || books.length === 0) {
      return res.status(400).json({ message: "Book list cannot be empty" });
    }

    const request = new BookRequest({
      user: userId,
      books,
      phoneNumber,
      status: "Pending",
    });

    await request.save();
    res.status(201).json({ message: "Request submitted successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
