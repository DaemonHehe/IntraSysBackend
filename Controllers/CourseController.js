const Course = require("../Models/Course");
const Lecturer = require("../Models/Lecturer");
const mongoose = require("mongoose");

// 📌  Create a New Course
const registerCourse = async (req, res) => {
  try {
    const { name, description, lecturer, category, duration } = req.body;

    const lecturerDoc = await Lecturer.findOne({ name: lecturer });
    if (!lecturerDoc) {
      return res.status(404).json({ error: "Lecturer not found by name" });
    }

    const newCourse = new Course({
      name,
      description,
      lecturer: lecturerDoc._id,
      category,
      duration,
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌  Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("lecturer", "name email");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌  Get a Single Course by ID
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

// 📌  Update a Course
const updateCourse = async (req, res) => {
  try {
    let { name, description, lecturer, category, duration } = req.body;

    // Check if another course already has this name
    const existingCourse = await Course.findOne({ name });
    if (existingCourse && existingCourse._id.toString() !== req.params.id) {
      return res.status(400).json({ error: "Course name must be unique" });
    }

    if (lecturer && !mongoose.Types.ObjectId.isValid(lecturer)) {
      const lecturerDoc = await Lecturer.findOne({ name: lecturer });
      if (!lecturerDoc) {
        return res.status(404).json({ error: "Lecturer not found by name" });
      }
      lecturer = lecturerDoc._id;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { name, description, lecturer, category, duration },
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

// 📌  Delete a Course
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

// 📌 Search Courses
const searchCourses = async (req, res) => {
  console.log(req.query);
  try {
    const { query } = req.query; // Get search query from the request

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Create a regular expression to perform a case-insensitive search
    const regexQuery = new RegExp(query, "i"); // 'i' makes it case-insensitive

    const courses = await Course.find({
      $or: [
        { name: { $regex: regexQuery } },
        { description: { $regex: regexQuery } },
        { category: { $regex: regexQuery } },
        { "lecturer.name": { $regex: regexQuery } }, // Search in lecturer's name
      ],
    }).populate("lecturer", "name email");

    if (courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }

    res.status(200).json(courses);
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
  searchCourses,
};
