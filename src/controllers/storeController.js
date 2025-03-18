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

// 🔹 Fetch stores based on School ID
const getStoresBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Find all stores linked to the given school ID
    const stores = await Store.find({ school: schoolId });

    if (stores.length === 0) {
      return res.status(404).json({ message: "No stores found for this school." });
    }

    res.status(200).json(stores);
  } catch (error) {
    console.error("Error fetching stores by school ID:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { registerStore, loginStore, getStoresBySchoolId };
