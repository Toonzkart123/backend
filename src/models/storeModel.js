const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  storeName: { type: String},
  address: { type: String},
  phoneNumber: { type: String},
  email: { type: String },
  managerName: { type: String},
  status: { type: String, enum: ["Pending", "Active", "Inactive"], default: "Pending" },
  website: { type: String },
  storeHours: { type: String },
  image: { type: String },
  description: { type: String },
  commissionRate: { type: Number },
  paymentTerms: { type: String },

  // 🔹 Reference to Schools (Supports multiple schools)
  schools: [{ type: mongoose.Schema.Types.ObjectId, ref: "School" }],

  // 🔹 Updated Inventory Schema
  inventory: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true }, // Book ID
      price: { type: Number, required: true }, // Store-specific price
      quantity: { type: Number, required: true, default: 0 }, // Available stock
    }
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Store", storeSchema);
