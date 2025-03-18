const express = require("express");
const { getAllSchools } = require("../controllers/schoolController");

const router = express.Router();

router.get("/", getAllSchools); // Fetch all schools

module.exports = router;
