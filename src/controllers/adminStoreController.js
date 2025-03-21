const Store = require("../models/storeModel");
const Book = require("../models/bookModel");

// 🔹 Add new store
exports.addStore = async (req, res) => {
  try {
    const {
      storeName,
      address,
      phoneNumber,
      email,
      managerName,
      status,
      website,
      storeHours,
      description,
      commissionRate,
      paymentTerms,
      password,
    } = req.body;

    const image = req.file ? req.file.path : null;

    const store = new Store({
      storeName,
      address,
      phoneNumber,
      email,
      managerName,
      status,
      website,
      storeHours,
      description,
      commissionRate,
      paymentTerms,
      image,
      password,
    });

    await store.save();

    res.status(201).json({ message: "Store added successfully", store });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔹 Get all stores
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔹 Get store by ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔹 Delete store
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};




// 🔹 Update store details (Admin)
exports.updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    // Copy fields from the request body into updateData
    const updateData = { ...req.body };

    // Handle image update if provided
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Remove 'inventory' from updateData to avoid modifying it
    delete updateData.inventory;

    // Use findByIdAndUpdate to update only the specified fields.
    // Setting runValidators: false will bypass inventory validation.
    const updatedStore = await Store.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: false });

    if (!updatedStore) {
      return res.status(404).json({ message: "Store not found" });
    }

    return res.status(200).json({ message: "Store updated successfully", store: updatedStore });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};



exports.addBookToStoreInventory = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      // Required fields
      title,
      author,
      isbn,
      category,
      price,
      stock,
      quantity,

      // Optional fields
      originalPrice,
      discount,
      status,
      publisher,
      publishDate,
      language,
      pages,
      description,
      image
    } = req.body;

    // ─────────────────────────────────────────────────────────────
    // 1. Parse numeric fields
    // ─────────────────────────────────────────────────────────────
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    const parsedQuantity = parseInt(quantity, 10);
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
    const parsedDiscount = discount ? parseFloat(discount) : 0;
    const parsedPages = pages ? parseInt(pages, 10) : 0;

    // Parse publish date if provided
    let parsedPublishDate = null;
    if (publishDate) {
      parsedPublishDate = new Date(publishDate);
      if (isNaN(parsedPublishDate)) {
        return res.status(400).json({
          message: "Invalid publishDate format. Use YYYY-MM-DD or a valid date string.",
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Validate required fields
    // ─────────────────────────────────────────────────────────────
    if (
      !title ||
      !author ||
      !isbn ||
      !category ||
      isNaN(parsedPrice) ||
      isNaN(parsedStock) ||
      isNaN(parsedQuantity)
    ) {
      return res.status(400).json({
        message: "Please provide Title, Author, ISBN, Category, Price, Stock, and Quantity correctly.",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Check if the Book already exists in the global inventory
    // ─────────────────────────────────────────────────────────────
    let book = await Book.findOne({ isbn });

    // ─────────────────────────────────────────────────────────────
    // 4. If the Book does not exist, create it in the global inventory
    // ─────────────────────────────────────────────────────────────
    // Use Multer file upload if available. If req.file exists, use its filename.
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (image || null);

    if (!book) {
      book = new Book({
        title,
        author,
        isbn,
        category,
        price: parsedPrice,             // Global price (optional concept)
        stock: parsedStock,             // Global stock
        description: description || "",
        image: imageUrl,
        originalPrice: parsedOriginalPrice,
        discount: parsedDiscount,
        status: status || "In Stock",   // If not provided, default to "In Stock"
        publisher: publisher || "",
        publishDate: parsedPublishDate,
        language: language || "English",
        pages: parsedPages
      });

      await book.save();
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Find the Store by storeId
    // ─────────────────────────────────────────────────────────────
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Check if this Book is already in the store's inventory
    // ─────────────────────────────────────────────────────────────
    const existingItem = store.inventory.find(
      (item) => item.book.toString() === book._id.toString()
    );

    if (existingItem) {
      // If it exists, update the store-specific price and increment quantity
      existingItem.price = parsedPrice;
      existingItem.quantity += parsedQuantity;
    } else {
      // Otherwise, add a new entry to the store's inventory
      store.inventory.push({
        book: book._id,
        price: parsedPrice,
        quantity: parsedQuantity,
      });
    }

    await store.save();

    return res.status(200).json({
      message: "Book added/updated in store inventory successfully",
      store,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};








// exports.addBookToStoreInventory = async (req, res) => {
//   try {
//     const { storeId } = req.params;
//     const {
//       // Required fields
//       title,
//       author,
//       isbn,
//       category,
//       price,
//       stock,
//       quantity,

//       // Optional fields
//       originalPrice,
//       discount,
//       status,
//       publisher,
//       publishDate,
//       language,
//       pages,
//       description,
//       image
//     } = req.body;

//     // ─────────────────────────────────────────────────────────────
//     // 1. Parse numeric fields
//     // ─────────────────────────────────────────────────────────────
//     const parsedPrice = parseFloat(price);
//     const parsedStock = parseInt(stock, 10);
//     const parsedQuantity = parseInt(quantity, 10);
//     const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
//     const parsedDiscount = discount ? parseFloat(discount) : 0;
//     const parsedPages = pages ? parseInt(pages, 10) : 0;

//     // Parse publish date if provided
//     let parsedPublishDate = null;
//     if (publishDate) {
//       parsedPublishDate = new Date(publishDate);
//       if (isNaN(parsedPublishDate)) {
//         return res.status(400).json({
//           message: "Invalid publishDate format. Use YYYY-MM-DD or a valid date string.",
//         });
//       }
//     }

//     // ─────────────────────────────────────────────────────────────
//     // 2. Validate required fields
//     // ─────────────────────────────────────────────────────────────
//     if (
//       !title ||
//       !author ||
//       !isbn ||
//       !category ||
//       isNaN(parsedPrice) ||
//       isNaN(parsedStock) ||
//       isNaN(parsedQuantity)
//     ) {
//       return res.status(400).json({
//         message: "Please provide Title, Author, ISBN, Category, Price, Stock, and Quantity correctly.",
//       });
//     }

//     // ─────────────────────────────────────────────────────────────
//     // 3. Check if the Book already exists in the global inventory
//     // ─────────────────────────────────────────────────────────────
//     let book = await Book.findOne({ isbn });

//     // ─────────────────────────────────────────────────────────────
//     // 4. If the Book does not exist, create it in the global inventory
//     // ─────────────────────────────────────────────────────────────
//     if (!book) {
//       book = new Book({
//         title,
//         author,
//         isbn,
//         category,
//         price: parsedPrice,             // Global price (optional concept)
//         stock: parsedStock,             // Global stock
//         description: description || "",
//         image: image || null,
//         originalPrice: parsedOriginalPrice,
//         discount: parsedDiscount,
//         status: status || "In Stock",   // If not provided, default to "In Stock"
//         publisher: publisher || "",
//         publishDate: parsedPublishDate,
//         language: language || "English",
//         pages: parsedPages
//       });

//       await book.save();
//     }

//     // ─────────────────────────────────────────────────────────────
//     // 5. Find the Store by storeId
//     // ─────────────────────────────────────────────────────────────
//     const store = await Store.findById(storeId);
//     if (!store) {
//       return res.status(404).json({ message: "Store not found" });
//     }

//     // ─────────────────────────────────────────────────────────────
//     // 6. Check if this Book is already in the store's inventory
//     // ─────────────────────────────────────────────────────────────
//     const existingItem = store.inventory.find(
//       (item) => item.book.toString() === book._id.toString()
//     );

//     if (existingItem) {
//       // If it exists, update the store-specific price and increment quantity
//       existingItem.price = parsedPrice;
//       existingItem.quantity += parsedQuantity;
//     } else {
//       // Otherwise, add a new entry to the store's inventory
//       store.inventory.push({
//         book: book._id,
//         price: parsedPrice,
//         quantity: parsedQuantity,
//       });
//     }

//     await store.save();

  
//     return res.status(200).json({
//       message: "Book added/updated in store inventory successfully",
//       store,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error", error });
//   }
// };


//update a book from store
exports.updateStoreInventoryItem = async (req, res) => {
  try {
    const { storeId, inventoryItemId } = req.params;
    const { price, quantity } = req.body; // The fields you want to update at store level

    // 1. Find the store
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // 2. Find the specific inventory item by its subdocument ID
    const inventoryItem = store.inventory.id(inventoryItemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // 3. Update store-specific fields if provided
    if (price !== undefined) {
      inventoryItem.price = parseFloat(price);
    }
    if (quantity !== undefined) {
      inventoryItem.quantity = parseInt(quantity, 10);
    }

    // 4. Save the store document
    await store.save();

    return res.status(200).json({
      message: "Store inventory item updated successfully",
      store,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

//Delete a book from store
exports.deleteStoreInventoryItem = async (req, res) => {
  try {
    const { storeId, inventoryItemId } = req.params;

    // 1. Find the store by ID
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // 2. Remove the inventory item using the pull method on the inventory array
    store.inventory.pull(inventoryItemId);

    // 3. Save the store document
    await store.save();

    return res.status(200).json({
      message: "Book removed from store inventory successfully",
      store,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};



































// exports.addBookToStoreInventory = async (req, res) => {
//   try {
//     const { storeId } = req.params;
//     const {
//       title,
//       author,
//       isbn,
//       category,
//       description,
//       price,
//       originalPrice,
//       discount,
//       stock,
//       status,
//       publisher,
//       publishDate,
//       language,
//       pages,
//       quantity, // store-specific quantity
//     } = req.body;

//     // Convert numeric fields from strings if necessary
//     const parsedPrice = parseFloat(price);
//     const parsedOriginalPrice = parseFloat(originalPrice);
//     const parsedDiscount = parseFloat(discount);
//     const parsedStock = parseInt(stock, 10);
//     const parsedPages = parseInt(pages, 10);
//     const parsedQuantity = parseInt(quantity, 10);

//     // Validate required fields (as in your global addBook)
//     if (!title || !author || !isbn || isNaN(parsedPrice) || isNaN(parsedStock) || !category) {
//       return res.status(400).json({ message: "Please provide all required fields correctly." });
//     }

//     // 1. Check if the Book already exists in the global inventory by ISBN
//     let book = await Book.findOne({ isbn });

//     // 2. If not, create a new Book in the global inventory with the provided fields
//     if (!book) {
//       let imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

//       book = new Book({
//         title,
//         author,
//         isbn,
//         category,
//         description,
//         price: parsedPrice,
//         originalPrice: parsedOriginalPrice || null,
//         discount: parsedDiscount || 0,
//         stock: parsedStock,
//         status,
//         publisher,
//         publishDate: publishDate ? new Date(publishDate) : null,
//         language,
//         pages: parsedPages || 0,
//         image: imageUrl,
//       });
//       await book.save();
//     }

//     // 3. Find the Store
//     const store = await Store.findById(storeId);
//     if (!store) {
//       return res.status(404).json({ message: "Store not found" });
//     }

//     // 4. Check if this Book is already in the store's inventory
//     const existingItem = store.inventory.find(
//       (item) => item.book.toString() === book._id.toString()
//     );

//     if (existingItem) {
//       // If the Book already exists, update store-specific price and increment quantity
//       existingItem.price = parsedPrice;
//       existingItem.quantity += parsedQuantity;
//     } else {
//       // Otherwise, add a new entry to the inventory array
//       store.inventory.push({
//         book: book._id,
//         price: parsedPrice,
//         quantity: parsedQuantity,
//       });
//     }

//     // 5. Save the Store
//     await store.save();

//     return res.status(200).json({
//       message: "Book added/updated in store inventory successfully",
//       store,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error", error });
//   }
// };









// exports.addBookToStoreInventory = async (req, res) => {
//   try {
//     const { storeId } = req.params;
//     const {
//       title,
//       author,
//       isbn,
//       category,
//       price,
//       stock,
//       quantity,
//       // Optional fields (if needed)
//       description,
//       image
//     } = req.body;

//     // Convert numeric values
//     const parsedPrice = parseFloat(price);
//     const parsedStock = parseInt(stock, 10);
//     const parsedQuantity = parseInt(quantity, 10);

//     // Validate required fields
//     if (!title || !author || !isbn || !category || isNaN(parsedPrice) || isNaN(parsedStock) || isNaN(parsedQuantity)) {
//       return res.status(400).json({ message: "Please provide Title, Author, ISBN, Category, Price, Stock, and Quantity correctly." });
//     }

//     // 1. Check if the Book already exists in the global inventory by ISBN
//     let book = await Book.findOne({ isbn });

//     // 2. If not, create a new Book in the global inventory using only the compulsory fields (plus optional description or image if provided)
//     if (!book) {
//       book = new Book({
//         title,
//         author,
//         isbn,
//         category,
//         price: parsedPrice,
//         stock: parsedStock,
//         description: description || "",
//         image: image || null
//       });
//       await book.save();
//     }

//     // 3. Find the Store
//     const store = await Store.findById(storeId);
//     if (!store) {
//       return res.status(404).json({ message: "Store not found" });
//     }

//     // 4. Check if this Book is already in the store's inventory
//     const existingItem = store.inventory.find(
//       (item) => item.book.toString() === book._id.toString()
//     );

//     if (existingItem) {
//       // If the Book already exists in the store inventory, update the store-specific price and increment quantity
//       existingItem.price = parsedPrice;
//       existingItem.quantity += parsedQuantity;
//     } else {
//       // Otherwise, add a new item with the store-specific fields
//       store.inventory.push({
//         book: book._id,
//         price: parsedPrice,
//         quantity: parsedQuantity,
//       });
//     }

//     // 5. Save the Store
//     await store.save();

//     return res.status(200).json({
//       message: "Book added/updated in store inventory successfully",
//       store,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error", error });
//   }
// };


