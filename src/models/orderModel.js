// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     books: [
//       {
//         book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
//         quantity: { type: Number, required: true },
//       },
//     ],
//     totalAmount: { type: Number, required: true },
//     status: { type: String, enum: ["Pending", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
//     createdAt: { type: Date, default: Date.now },
//   });
  
//   module.exports = mongoose.model("Order", orderSchema);
  

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // e.g., ORD-1001
  orderDate: { type: Date, default: Date.now, required: true },
  paymentMethod: { type: String, required: true },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerId: { type: String, required: true }, // e.g., CUST-1234

  shippingAddress: { type: String, required: true },

  books: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } // Individual price at the time of order
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
