const Store = require("../models/storeModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Store Registration (Signup)
const registerStore = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the store already exists
    let store = await Store.findOne({ email });
    if (store) {
      return res.status(400).json({ message: "Store already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new store
    store = new Store({
      name,
      email,
      password: hashedPassword,
    });

    await store.save();

    // Generate JWT token
    const token = jwt.sign({ id: store._id, role: "store" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "Store registered successfully", token, storeId: store._id });
  } catch (error) {
    console.error("Error in registerStore:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Store Login
const loginStore = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the store exists
    let store = await Store.findOne({ email });
    if (!store) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, store.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: store._id, role: "store" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Store login successful", token, storeId: store._id });
  } catch (error) {
    console.error("Error in loginStore:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Existing Functionality (Fetching stores by schoolId)
const getStoresBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const stores = await Store.find({ schools: schoolId });

    if (stores.length === 0) {
      return res.status(404).json({ message: 'No stores found for this school.' });
    }

    res.status(200).json(stores);
  } catch (error) {
    console.error('Error fetching stores by school ID:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// ✅ New Functionality: Add a school ID to a store
const addSchoolToStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { schoolId } = req.body;

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $addToSet: { schools: schoolId } }, // Prevent duplicates
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    res.status(200).json({
      message: 'School added to store successfully.',
      store: updatedStore
    });
  } catch (error) {
    console.error('Error adding school to store:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// ✅ New Functionality: Remove a school ID from a store
const removeSchoolFromStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { schoolId } = req.body;

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $pull: { schools: schoolId } },
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    res.status(200).json({
      message: 'School removed from store successfully.',
      store: updatedStore
    });
  } catch (error) {
    console.error('Error removing school from store:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

const getStoresByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    // Find stores where the given book ID is in the inventory array
    const stores = await Store.find({ "inventory.book": bookId });

    if (stores.length === 0) {
      return res.status(404).json({ message: "No stores found for this book" });
    }

    res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { registerStore, loginStore, getStoresBySchoolId, getStoresByBookId, addSchoolToStore, removeSchoolFromStore };
