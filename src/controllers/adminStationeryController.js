const Stationery = require("../models/stationeryModel");
const fs = require("fs"); // For deleting images from the server

exports.addStationery = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      price,
      originalPrice,
      discount,
      stock,
      status,
      material,
      color,
      code,  // ✅ New field added
    } = req.body;

    // Convert string values to numbers where needed
    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = parseFloat(originalPrice);
    const parsedDiscount = parseFloat(discount);
    const parsedStock = parseInt(stock);
    const parsedCode = parseInt(code);

    // Check required fields: name, category, price, stock, code
    if (
      !name ||
      !category ||
      isNaN(parsedPrice) ||
      isNaN(parsedStock) ||
      isNaN(parsedCode)
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields correctly." });
    }

    // Handle Image Upload (if any file is uploaded)
    const imageUrl = req.file ? req.file.path : null;


    const newStationery = new Stationery({
      name,
      brand,
      category,
      description,
      price: parsedPrice,
      originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,
      discount: !isNaN(parsedDiscount) ? parsedDiscount : 0,
      stock: parsedStock,
      status,
      material,
      color,
      code: parsedCode,  // ✅ Added code field here
      image: imageUrl,
    });

    await newStationery.save();
    return res.status(201).json({
      message: "Stationery item added successfully",
      stationery: newStationery,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};


// 🔹 Fetch All Stationery Items (Admin Only)
exports.getAllStationery = async (req, res) => {
  try {
    // Sort by creation date (descending) to show newest first
    const items = await Stationery.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};

// 🔹 Fetch a Single Stationery Item by ID (Admin Only)
exports.getStationeryById = async (req, res) => {
  try {
    const item = await Stationery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Stationery item not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};



exports.updateStationery = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      price,
      originalPrice,
      discount,
      stock,
      status,
      material,
      color,
      code,  // ✅ New field added
    } = req.body;

    // Find existing item
    const item = await Stationery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Stationery item not found" });
    }

    // Convert numeric fields
    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = parseFloat(originalPrice);
    const parsedDiscount = parseFloat(discount);
    const parsedStock = parseInt(stock);
    const parsedCode = parseInt(code);

    // If a new file is uploaded, update the image path
    if (req.file) {
        item.image = req.file.path; // Cloudinary URL
      }

    // Update each field if provided; otherwise, keep existing value
    if (name) item.name = name;
    if (brand) item.brand = brand;
    if (category) item.category = category;
    if (description) item.description = description;
    if (!isNaN(parsedPrice)) item.price = parsedPrice;
    if (!isNaN(parsedOriginalPrice)) item.originalPrice = parsedOriginalPrice;
    if (!isNaN(parsedDiscount)) item.discount = parsedDiscount;
    if (!isNaN(parsedStock)) item.stock = parsedStock;
    if (status) item.status = status;
    if (material) item.material = material;
    if (color) item.color = color;
    if (!isNaN(parsedCode)) item.code = parsedCode; // ✅ Update code if provided

    await item.save();
    return res.status(200).json({
      message: "Stationery item updated successfully",
      stationery: item,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};


// 🔹 Delete a Stationery Item (Admin Only)
exports.deleteStationery = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the stationery item
    const item = await Stationery.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Stationery item not found" });
    }

    // Remove the image file from `uploads/` if it exists
    if (item.image) {
      const imagePath = `.${item.image}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the file
      }
    }

    // Delete the stationery record
    await Stationery.findByIdAndDelete(id);

    return res.status(200).json({ message: "Stationery item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};
