const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // Usually you'd want the code to be unique
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    // If you want an active/inactive toggle beyond the date range
    // you can keep isActive, but you could also rely on date checks alone
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoCode', PromoCodeSchema);
