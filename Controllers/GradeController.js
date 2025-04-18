const Grade = require("../Models/Grade");
const Course = require("../Models/Course");
const User = require("../Models/User");

// 📌 1️⃣ Create a New Grade
const assignGrade = async (req, res) => {
  try {
    const { student, course, status, remarks } = req.body;

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
    const newGrade = new Grade({ student, course, status, remarks });
    await newGrade.save();

    studentExists.grades.push(newGrade._id);
    await studentExists.save();

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
    const { status, remarks } = req.body;

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
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

// Get all grades for a specific student
const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const grades = await Grade.find({ student: studentId }).populate(
      "course",
      "title status"
    );

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all grades for a specific course
const getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;

    const grades = await Grade.find({ course: courseId })
      .populate("student", "name email")
      .populate("course", "title");

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
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
  assignGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  getStudentGrades,
  getCourseGrades,
  deleteGrade,
};
