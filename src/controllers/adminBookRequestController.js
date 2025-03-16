const BookRequest = require("../models/bookRequestModel");

// ✅ **1. Fetch All Book Requests (Admin)**
exports.getAllBookRequests = async (req, res) => {
  try {
    const requests = await BookRequest.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ **2. Fetch a Specific Book Request by ID (Admin)**
exports.getBookRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await BookRequest.findById(id).populate("user", "name email");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ **3. Update Book Request Status (Admin)**
exports.updateBookRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await BookRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request updated successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ **4. Delete a Book Request (Admin)**
exports.deleteBookRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await BookRequest.findByIdAndDelete(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
