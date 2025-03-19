const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },  // e.g., "Home", "Office"
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: "India" },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // New Field (Optional)
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }, // New Field
  password: { type: String, required: true },
  addresses: [addressSchema],
  role: { type: String, enum: ["user", "admin", "store"], default: "user" },
  profilePicture: { type: String },
  preferences: {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    subjects: [{ type: String }],
  },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("User", userSchema);
