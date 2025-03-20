const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    forgotPassword,
    resetPassword, 
    getUserProfile,
    addAddress,
    updateAddress,
    deleteAddress
  } = require('../controllers/userController');


const router = express.Router();

// User Registration
router.post("/register", registerUser);

// User Login
router.post("/login", loginUser);



// Wishlist operations
router.use(authenticateUser);

router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:bookId', removeFromWishlist);

//Password reset Logic
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 🔹 Profile: Get user details
router.get("/profile", getUserProfile);

// 🔹 Addresses
router.post("/addresses", addAddress);             // Add new address
router.put("/addresses/:addressId", updateAddress); // Update address
router.delete("/addresses/:addressId", deleteAddress); // Remove address

router.delete("/", clearWishlist);     // Clear wishlist





module.exports = router;
