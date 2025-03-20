const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Store = require("../models/storeModel");

// Middleware to verify JWT token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Invalid user token" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};



// Middleware to verify Admin authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    
    req.admin = await Admin.findById(decoded.id).select("-password");
    if (!req.admin) {
      return res.status(401).json({ message: "Invalid admin token" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};


// Middleware to verify Store authentication
const authenticateStore = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    
    req.store = await Store.findById(decoded.id).select("-password");
    if (!req.store) {
      return res.status(401).json({ message: "Invalid store token" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = { authenticateUser, authenticateAdmin, authenticateStore };
