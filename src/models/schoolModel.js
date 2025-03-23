// src/models/School.js
const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
    city: { type: String, required: true },
    address: { type: String, required: true },
  
  image: { type: String }, // URL or path to the uploaded image
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("School", schoolSchema);