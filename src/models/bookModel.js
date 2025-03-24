// const mongoose = require("mongoose");

// const bookSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     author: { type: String, required: true },
//     description: { type: String },
//     isbn: { type: String, unique: true },
//     price: { type: Number, required: true },
//     stock: { type: Number, default: 0 },
//     school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
//     subject: { type: String, required: true },
//     reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
//     image: { type: String },
//     createdAt: { type: Date, default: Date.now },
//   });
  
//   module.exports = mongoose.model("Book", bookSchema);
  

const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true, required: true },
  category: { type: String }, // New Field (Dropdown)
  description: { type: String },

  price: { type: Number, required: true }, // Current Price
  originalPrice: { type: Number }, // New Field (If on sale)
  discount: { type: Number, default: 0 }, // New Field (Percentage Discount)

  stock: { type: Number, default: 0, required: true }, // Required
  status: { type: String, enum: ["In Stock", "Out of Stock"], default: "In Stock" }, // New Field (Dropdown)

  publisher: { type: String }, // New Field
  publishDate: { type: Date }, // New Field
  language: { type: String, default: "English" }, // New Field
  pages: { type: Number, default: 0 }, // New Field

  image: { type: String }, // Book Cover Image (Will store file URL)
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Book", bookSchema);
