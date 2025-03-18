const School = require("../models/schoolModel");
const Store = require("../models/storeModel");

// Fetch all schools
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ name: 1 });
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Fetch stores linked to a school
exports.getStoresBySchool = async (req, res) => {
    try {
      const { schoolId } = req.params;
  
      // Find school with linked stores
      const school = await School.findById(schoolId).populate("stores", "storeName address phoneNumber");
  
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
  
      res.status(200).json(school.stores);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };