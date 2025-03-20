const User = require("../models/userModel");
const Wishlist = require("../models/whishlistModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); // Import the email helper
const crypto = require("crypto");


// Register User (Signup)

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "User registered successfully", token, userId: user._id });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, userId: user._id });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    console.log("Forgot Password Request for email:", normalizedEmail);

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.error("User not found with email:", normalizedEmail);
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token using crypto
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set token and expiration (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds

    // Save user without running full validations (to bypass missing password validation)
    await user.save({ validateBeforeSave: false });

    // Construct reset URL using your CLIENT_URL
    const resetUrl = `https://consumer-omega.vercel.app/reset-password/${resetToken}`;
    const message = `Click the link to reset your password: ${resetUrl}`;

    // Send the reset email using your sendEmail helper
    await sendEmail(user.email, "Password Reset", message);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newPassword } = req.body;

//     // Find user with valid reset token
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     // Manually hash the new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Clear reset token fields
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     // Save user without bypassing validation since we've already hashed the password
//     await user.save();

//     return res.status(200).json({ message: "Password reset successful" });
//   } catch (error) {
//     console.error("Error resetting password:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    // Use the field "password" as sent by your frontend
    const { password } = req.body; 

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find a user with a valid reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.wishlist.includes(bookId)) {
      user.wishlist.push(bookId);
      await user.save();
    }

    res.json({ message: 'Book added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wishlist = user.wishlist.filter((id) => id.toString() !== bookId);
    await user.save();

    res.json({ message: 'Book removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Clear the entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.books = []; // Empty the books array
    await wishlist.save();

    res.status(200).json({ message: "Wishlist cleared successfully", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};



// 1) 🔹 Get User Profile (includes addresses)
const getUserProfile = async (req, res) => {
  try {
    // "req.user._id" is typically set by "authenticateUser" from your JWT payload
    const user = await User.findById(req.user._id).select("-password"); 
    // ^.select("-password") omits the hashed password in the response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

// 2) 🔹 Add a New Address
const addAddress = async (req, res) => {
  try {
    const {
      label,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault
    } = req.body;

    // Fetch the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user sets this address as default, clear default from existing addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Push the new address into addresses array
    user.addresses.push({
      label: label || "Home",
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: !!isDefault
    });

    await user.save();
    return res
      .status(201)
      .json({ message: "Address added successfully", addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

// 3) 🔹 Update an Existing Address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const {
      label,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the specific address
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If making this address the default, clear default from others
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update only the fields provided
    if (label) address.label = label;
    if (fullName) address.fullName = fullName;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    if (phone) address.phone = phone;
    address.isDefault = !!isDefault;

    await user.save();
    return res
      .status(200)
      .json({ message: "Address updated successfully", addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};


// 4) 🔹 Delete an Address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    console.log("DELETE Address Called. addressId:", addressId);

    const user = await User.findById(req.user._id);
    if (!user) {
      console.error("User not found with ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user._id, "Addresses:", user.addresses);

    // Use pull() to remove the address by its _id
    user.addresses.pull({ _id: addressId });
    console.log("Address removed using pull().");

    await user.save();
    console.log("Updated addresses:", user.addresses);

    return res
      .status(200)
      .json({ message: "Address deleted successfully", addresses: user.addresses });
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};



module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getWishlist, addToWishlist, removeFromWishlist, clearWishlist, getUserProfile,
  addAddress,
  updateAddress,
  deleteAddress };

