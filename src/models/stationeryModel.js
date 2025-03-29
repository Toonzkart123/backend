const mongoose = require("mongoose");

const stationerySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Stationery Item Name
  brand: { type: String },
  category: {
    type: String,
    enum: ["Pens", "Pencils", "Notebooks", "Erasers", "Markers", "Files & Folders", "Other"],
  },
  description: { type: String },

  price: { type: Number, required: true }, // Selling Price
  originalPrice: { type: Number },         // MRP (if on sale)
  discount: { type: Number, default: 0 },  // Discount Percentage

  stock: { type: Number, default: 0, required: true }, // Available stock
  status: {
    type: String,
    enum: ["In Stock", "Out of Stock"],
    default: "In Stock",
  },

  material: { type: String },
  color: { type: String },
  code:{ type: Number},
  image: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Stationery", stationerySchema);
