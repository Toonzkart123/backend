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
    const updateData = { ...req.body };

    // Handle image update if provided
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Find store by ID
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // If inventory is provided, append items instead of overwriting
    if (updateData.inventory && Array.isArray(updateData.inventory)) {
      const newItems = updateData.inventory.map(item => ({ book: item.book }));
      // Append to existing array
      store.inventory.push(...newItems);

      // Remove 'inventory' from updateData so it won't overwrite
      delete updateData.inventory;
    }

    // Apply only provided fields (allow partial updates) 
    // - This will update all other fields except 'inventory' which we already handled.
    Object.assign(store, updateData);

    await store.save();

    res.status(200).json({ message: "Store updated successfully", store });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};




// 🔹 Add a Book in a Store’s Inventory

// exports.addBookToStoreInventory = async (req, res) => {
//   try {
//     const { storeId } = req.params;
//     const {
//       isbn,
//       title,
//       author,
//       category,
//       description,
//       price,
//       quantity,
//       // Add any additional fields if needed
//     } = req.body;

//     // 1. Check if the Book already exists in the global inventory by ISBN
//     let book = await Book.findOne({ isbn });

//     // 2. If not, create a new Book in the global inventory
//     if (!book) {
//       book = new Book({
//         isbn,
//         title,
//         author,
//         category,
//         description,
//         price: parseFloat(price) || 0,  // optional "global" price
//         stock: parseInt(quantity) || 0, // if you want to track global stock
//         // ... other fields from req.body if needed
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
//       // If the Book already exists, update price/quantity
//       existingItem.price = parseFloat(price);
//       existingItem.quantity += parseInt(quantity, 10);
//     } else {
//       // Otherwise, push a new item
//       store.inventory.push({
//         book: book._id,
//         price: parseFloat(price),
//         quantity: parseInt(quantity, 10),
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







exports.addBookToStoreInventory = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      title,
      author,
      isbn,
      category,
      description,
      price,
      originalPrice,
      discount,
      stock,
      status,
      publisher,
      publishDate,
      language,
      pages,
      quantity, // store-specific quantity
    } = req.body;

    // Convert numeric fields from strings if necessary
    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = parseFloat(originalPrice);
    const parsedDiscount = parseFloat(discount);
    const parsedStock = parseInt(stock, 10);
    const parsedPages = parseInt(pages, 10);
    const parsedQuantity = parseInt(quantity, 10);

    // Validate required fields (as in your global addBook)
    if (!title || !author || !isbn || isNaN(parsedPrice) || isNaN(parsedStock) || !category) {
      return res.status(400).json({ message: "Please provide all required fields correctly." });
    }

    // 1. Check if the Book already exists in the global inventory by ISBN
    let book = await Book.findOne({ isbn });

    // 2. If not, create a new Book in the global inventory with the provided fields
    if (!book) {
      let imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      book = new Book({
        title,
        author,
        isbn,
        category,
        description,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice || null,
        discount: parsedDiscount || 0,
        stock: parsedStock,
        status,
        publisher,
        publishDate: publishDate ? new Date(publishDate) : null,
        language,
        pages: parsedPages || 0,
        image: imageUrl,
      });
      await book.save();
    }

    // 3. Find the Store
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // 4. Check if this Book is already in the store's inventory
    const existingItem = store.inventory.find(
      (item) => item.book.toString() === book._id.toString()
    );

    if (existingItem) {
      // If the Book already exists, update store-specific price and increment quantity
      existingItem.price = parsedPrice;
      existingItem.quantity += parsedQuantity;
    } else {
      // Otherwise, add a new entry to the inventory array
      store.inventory.push({
        book: book._id,
        price: parsedPrice,
        quantity: parsedQuantity,
      });
    }

    // 5. Save the Store
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
