const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true }
  },
  image: { type: String }, // URL or path to the uploaded image
  stores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }], // Linked Stores
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("School", schoolSchema);
