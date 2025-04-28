const express = require("express");
const { getAllSchools } = require("../controllers/schoolController");
const { getSchoolById } = require("../controllers/adminSchoolController");

const router = express.Router();

router.get("/", getAllSchools); // Fetch all schools
router.get("/:id", getSchoolById);

module.exports = router;
