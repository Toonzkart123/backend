const Store = require("../models/storeModel");

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


// // 🔹 Update store details
// exports.updateStore = async (req, res) => {
//   try {
//     const {
//       storeName,
//       address,
//       phoneNumber,
//       email,
//       managerName,
//       status,
//       website,
//       storeHours,
//       description,
//       commissionRate,
//       paymentTerms,
//     } = req.body;

//     const updatedData = {
//       storeName,
//       address,
//       phoneNumber,
//       email,
//       managerName,
//       status,
//       website,
//       storeHours,
//       description,
//       commissionRate,
//       paymentTerms,
//     };

//     if (req.file) {
//       updatedData.image = req.file.path;
//     }

//     const store = await Store.findByIdAndUpdate(req.params.id, updatedData, { new: true });

//     if (!store) return res.status(404).json({ message: "Store not found" });

//     res.status(200).json({ message: "Store updated successfully", store });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };








// // 🔹 Update store details (Admin)
// exports.updateStore = async (req, res) => {
//   try {
//     const updateData = req.body;

//     // Handle image update if provided
//     if (req.file) {
//       updateData.image = req.file.path;
//     }

//     // Find store by ID
//     const store = await Store.findById(req.params.id);
//     if (!store) return res.status(404).json({ message: "Store not found" });

//     // If inventory is provided, update it
//     if (updateData.inventory && Array.isArray(updateData.inventory)) {
//       store.inventory = updateData.inventory.map(item => ({ book: item.book }));
//     }

//     // Apply only provided fields (allow partial updates)
//     Object.assign(store, updateData);
//     await store.save();

//     res.status(200).json({ message: "Store updated successfully", store });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };





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
