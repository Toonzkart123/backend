// controllers/orderController.js
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const User = require("../models/userModel");

// Create Order with category-based items
exports.createOrder = async (req, res) => {
  try {
    const {
      orderId,
      paymentMethod,
      customerId,
      shippingAddress,
      items, // each item: { category, productId, quantity, price }
      totalAmount
    } = req.body;

    const userId = req.user._id;

    if (!orderId || !paymentMethod || !customerId || !shippingAddress || !items || items.length === 0 || !totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid order details.' });
    }

    const order = new Order({
      orderId,
      paymentMethod,
      customerId,
      shippingAddress,
      user: userId,
      items,
      totalAmount,
      status: 'Pending',
      orderDate: new Date()
    });

    await order.save();

    await User.findByIdAndUpdate(
      userId,
      { $push: { orderHistory: order._id } },
      { new: true, useFindAndModify: false }
    );

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('CREATE ORDER ERROR:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};


// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       orderId,
//       paymentMethod,
//       customerId,
//       shippingAddress,
//       books, // each book: { book (id), quantity, price }
//       totalAmount
//     } = req.body;

//     const userId = req.user._id; // Extracted from authenticated token

//     // Basic validation
//     if (!orderId || !paymentMethod || !customerId || !shippingAddress) {
//       return res.status(400).json({ message: "Missing required order details." });
//     }

//     if (!books || books.length === 0) {
//       return res.status(400).json({ message: "Order must contain at least one book." });
//     }

//     if (!totalAmount || totalAmount <= 0) {
//       return res.status(400).json({ message: "Invalid total amount." });
//     }

//     // Creating new order with detailed schema
//     const order = new Order({
//       orderId,
//       paymentMethod,
//       customerId,
//       shippingAddress,
//       user: userId,
//       books,
//       totalAmount,
//       status: "Pending",
//       orderDate: new Date()
//     });

//     await order.save();

//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };


// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       orderId,
//       paymentMethod,
//       customerId,
//       shippingAddress,
//       books, // each book: { book (id), quantity, price }
//       totalAmount
//     } = req.body;

//     const userId = req.user._id; // Extracted from authenticated token

//     // Basic validation
//     if (!orderId || !paymentMethod || !customerId || !shippingAddress) {
//       return res.status(400).json({ message: "Missing required order details." });
//     }

//     if (!books || books.length === 0) {
//       return res.status(400).json({ message: "Order must contain at least one book." });
//     }

//     if (!totalAmount || totalAmount <= 0) {
//       return res.status(400).json({ message: "Invalid total amount." });
//     }

//     // Creating new order with detailed schema
//     const order = new Order({
//       orderId,
//       paymentMethod,
//       customerId,
//       shippingAddress,
//       user: userId,
//       books,
//       totalAmount,
//       status: "Pending",
//       orderDate: new Date()
//     });

//     await order.save();

//     // **Update User Order History**
//     await User.findByIdAndUpdate(
//       userId,
//       { $push: { orderHistory: order._id } }, // Push order ID to orderHistory
//       { new: true, useFindAndModify: false }
//     );

//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };



// exports.getUserOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error });
//   }
// };


exports.getUserOrders = async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find()
      .populate("books.book", "title price") // Populate book details
      .sort({ createdAt: -1 });

    // Filter orders where `user` matches the logged-in user's ID
    const userOrders = orders.filter(order => order.user.toString() === req.user._id.toString());

    res.status(200).json(userOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};




exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('items.bookId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
