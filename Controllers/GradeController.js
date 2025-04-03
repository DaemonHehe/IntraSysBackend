const Grade = require("../models/GradeModel");
const Course = require("../models/CourseModel");
const User = require("../models/UserModel");

// 📌 1️⃣ Create a New Grade
const registerGrade = async (req, res) => {
  try {
    const { student, course, grade, remarks } = req.body;

    // Ensure the student and course exist
    const studentExists = await User.findById(student);
    if (!studentExists)
      return res.status(404).json({ error: "Student not found" });

    const courseExists = await Course.findById(course);
    if (!courseExists)
      return res.status(404).json({ error: "Course not found" });

    // Check if the student already has a grade for this course
    const existingGrade = await Grade.findOne({ student, course });
    if (existingGrade)
      return res.status(400).json({
        error: "Grade already exists for this student in this course",
      });

    // Create the grade
    const newGrade = new Grade({ student, course, grade, remarks });
    await newGrade.save();

    res
      .status(201)
      .json({ message: "Grade assigned successfully", grade: newGrade });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 2️⃣ Get All Grades
const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate("student", "name email") // Populate student details
      .populate("course", "name category"); // Populate course details

    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 3️⃣ Get a Single Grade by ID
const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate("student", "name email")
      .populate("course", "name category");

    if (!grade) return res.status(404).json({ error: "Grade not found" });

    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 4️⃣ Update a Grade
const updateGrade = async (req, res) => {
  try {
    const { grade, remarks } = req.body;

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      { grade, remarks },
      { new: true, runValidators: true }
    );

    if (!updatedGrade)
      return res.status(404).json({ error: "Grade not found" });

    res
      .status(200)
      .json({ message: "Grade updated successfully", grade: updatedGrade });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 5️⃣ Delete a Grade
const deleteGrade = async (req, res) => {
  try {
    const deletedGrade = await Grade.findByIdAndDelete(req.params.id);
    if (!deletedGrade)
      return res.status(404).json({ error: "Grade not found" });

    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
};
