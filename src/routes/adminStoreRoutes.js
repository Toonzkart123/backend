const express = require("express");
const {
  addStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  addBookToStoreInventory
} = require("../controllers/adminStoreController");
const { authenticateAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// 🔹 Add new store
router.post("/", authenticateAdmin, upload.single("image"), addStore);

// 🔹 Fetch all stores
router.get("/", authenticateAdmin, getAllStores);

// 🔹 Fetch store by ID
router.get("/:id", authenticateAdmin, getStoreById);

// 🔹 Update store
router.put("/:id", authenticateAdmin, upload.single("image"), updateStore);

// 🔹 Delete store
router.delete("/:id", authenticateAdmin, deleteStore);

router.post("/:storeId/inventory", authenticateAdmin, addBookToStoreInventory);


module.exports = router;
