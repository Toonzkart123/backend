// controllers/cartController.js
const Cart = require('../models/cartModel');
const Book = require('../models/bookModel');

// GET user cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.bookId');
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// ADD item to cart
exports.addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.bookId.toString() === bookId);

    if (itemIndex > -1) {
      // Update quantity if item already exists
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      // Push new item
      cart.items.push({ bookId, quantity: quantity || 1 });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// UPDATE cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// REMOVE item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// CLEAR entire cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
