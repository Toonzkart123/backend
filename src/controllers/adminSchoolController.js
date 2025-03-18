const School = require("../models/schoolModel");

// 🔹 Add new school
exports.addSchool = async (req, res) => {
  try {
    const { name, city, address } = req.body;
    const image = req.file ? req.file.path : null;

    const school = new School({
      name,
      location: { city, address },
      image,
    });

    await school.save();

    res.status(201).json({ message: "School added successfully", school });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔹 Get all schools
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔹 Get school by ID
exports.getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔹 Update school details
exports.updateSchool = async (req, res) => {
  try {
    const { name, city, address } = req.body;
    const updatedData = {
      name,
      location: { city, address },
    };

    if (req.file) {
      updatedData.image = req.file.path;
    }

    const school = await School.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!school) return res.status(404).json({ message: "School not found" });

    res.status(200).json({ message: "School updated successfully", school });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔹 Delete school
exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    res.status(200).json({ message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
