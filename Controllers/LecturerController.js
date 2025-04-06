const Lecturer = require("../Models/Lecturer");
const jwt = require("jsonwebtoken");

const generateToken = (lecturer) => {
  return jwt.sign(
    { id: lecturer._id, email: lecturer.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Register Lecturer
const registerLecturer = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    let lecturer = await Lecturer.findOne({ email });
    if (lecturer)
      return res.status(400).json({ message: "Lecturer already exists" });

    lecturer = new Lecturer({ name, email, password, department });
    await lecturer.save();

    res.status(201).json({
      message: "Lecturer registered successfully",
      token: generateToken(lecturer),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Login Lecturer
const loginLecturer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const lecturer = await Lecturer.findOne({ email });
    if (!lecturer || !(await lecturer.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", token: generateToken(lecturer) });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Logout Lecturer (Client should clear the token)
const logoutLecturer = async (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Lecturers
const getAllLecturers = async (req, res) => {
  try {
    const lecturers = await Lecturer.find().select("-password"); // Exclude password
    res.json(lecturers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get a Single Lecturer by ID
const getLecturer = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id).select("-password"); // Exclude password
    if (!lecturer)
      return res.status(404).json({ message: "Lecturer not found" });

    res.json(lecturer);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update Lecturer
const updateLecturer = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedLecturer = await Lecturer.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedLecturer)
      return res.status(404).json({ message: "Lecturer not found" });

    res.json({
      message: "Lecturer updated successfully",
      Lecturer: updatedLecturer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Lecturer
const deleteLecturer = async (req, res) => {
  try {
    const lecturer = await Lecturer.findByIdAndDelete(req.params.id);

    if (!lecturer)
      return res.status(404).json({ message: "Lecturer not found" });

    res.json({ message: "Lecturer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  registerLecturer,
  loginLecturer,
  logoutLecturer,
  getAllLecturers,
  getLecturer,
  updateLecturer,
  deleteLecturer,
};
