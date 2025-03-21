// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      category: { type: String, required: true, enum: ['Book', 'Stationery'] },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'items.category'
      },
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);