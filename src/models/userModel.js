const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // New Field (Optional)
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }, // New Field
  password: { type: String, required: true },
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
