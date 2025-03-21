const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  orderDate: { type: Date, default: Date.now, required: true },
  paymentMethod: { type: String, required: true },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerId: { type: String, required: true },
  shippingAddress: { type: String, required: true },

  items: [
    {
      category: { type: String, required: true, enum: ['Book', 'Stationery'] },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'items.category'
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  

  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Completed", "Cancelled", "Returned"],
    default: "Pending"
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);

