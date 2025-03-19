const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const BookRequest = require("../models/bookRequestModel");


// 🔹 Admin Adds a New User
exports.addUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, status } = req.body;

    // Check if the user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone: phone || "", // Optional
      password: hashedPassword,
      role: role || "user", // Default to 'user'
      status: status || "Active", // Default to 'Active'
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully", user: newUser });
  } catch (error) {
    console.error("Error in addUser:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};



// 🔹 Fetch All Users (Admin Only)
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select("-password").sort({ createdAt: -1 }); // Exclude password, Sort by latest
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };

  // 🔹 Fetch a Single User by ID (Admin Only)
exports.getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password"); // Exclude password
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };
  

  // 🔹 Update User Details (Admin Only)
  exports.updateUser = async (req, res) => {
    try {
      const { name, email, phone, role, status } = req.body;
  
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Prevent email duplication
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = email;
      }
  
      // Update fields
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.role = role || user.role;
      user.status = status || user.status;
  
      await user.save();
  
      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };




// 🔹 Delete a User (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
  
    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Prevent admin from deleting themselves
    if (req.admin && req.admin._id.toString() === id) {
      return res.status(403).json({ message: "You cannot delete yourself" });
    }
    
    // Find and delete all book requests associated with this user
    await BookRequest.deleteMany({ user: id });
    
    // Delete the user from the database
    await User.findByIdAndDelete(id);
  
    res.status(200).json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};



//   // 🔹 Delete a User (Admin Only)
// exports.deleteUser = async (req, res) => {
//     try {
//       const { id } = req.params;
  
//       // Find the user
//       const user = await User.findById(id);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       // Prevent admin from deleting themselves
//       if (req.admin && req.admin._id.toString() === id) {
//         return res.status(403).json({ message: "You cannot delete yourself" });
//       }
  
//       // Delete the user from the database
//       await User.findByIdAndDelete(id);
  
//       res.status(200).json({ message: "User deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ message: "Server Error", error });
//     }
//   };