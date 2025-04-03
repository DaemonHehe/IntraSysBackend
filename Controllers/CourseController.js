const Course = require("../Models/Course");
const Lecturer = require("../models/LecturerModel");

// 📌 1️⃣ Create a New Course
const registerCourse = async (req, res) => {
  try {
    const { name, description, lecturer, category, price, duration, level } =
      req.body;

    const lecturerExists = await Lecturer.findById(lecturer);
    if (!lecturerExists) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    const newCourse = new Course({
      name,
      description,
      lecturer,
      category,
      price,
      duration,
      level,
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 2️⃣ Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("lecturer", "name email");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 3️⃣ Get a Single Course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "lecturer",
      "name email"
    );
    if (!course) return res.status(404).json({ error: "Course not found" });

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 4️⃣ Update a Course
const updateCourse = async (req, res) => {
  try {
    const { name, description, lecturer, category, price, duration, level } =
      req.body;

    // Check if another course already has this name
    const existingCourse = await Course.findOne({ name });
    if (existingCourse && existingCourse._id.toString() !== req.params.id) {
      return res.status(400).json({ error: "Course name must be unique" });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { name, description, lecturer, category, price, duration, level },
      { new: true, runValidators: true }
    );

    if (!updatedCourse)
      return res.status(404).json({ error: "Course not found" });

    res
      .status(200)
      .json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 5️⃣ Delete a Course
const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse)
      return res.status(404).json({ error: "Course not found" });

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
