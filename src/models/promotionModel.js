// models/PromoCode.js
const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoCode', PromoCodeSchema);