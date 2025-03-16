const mongoose = require("mongoose");


const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  managerName: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Active", "Inactive"], default: "Pending" },
  website: { type: String },
  storeHours: { type: String },
  image: { type: String },
  description: { type: String },
  commissionRate: { type: Number},
  paymentTerms: { type: String },

  inventory: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    stock: { type: Number, default: 0 }
  }],

  createdAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model("Store", storeSchema);
