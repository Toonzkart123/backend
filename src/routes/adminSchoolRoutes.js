const express = require("express");
const { authenticateAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // ✅ existing upload.js middleware
const {
  addSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  addSchoolBookset,
} = require("../controllers/adminSchoolController");

const router = express.Router();

router.post("/", authenticateAdmin, upload.single("image"), addSchool);
router.get("/", authenticateAdmin, getAllSchools);
router.get("/:id", authenticateAdmin, getSchoolById);
router.put("/:id", authenticateAdmin, upload.single("image"), updateSchool);
router.put("/bookset/:id", addSchoolBookset);
router.delete("/:id", authenticateAdmin, deleteSchool);

module.exports = router;
