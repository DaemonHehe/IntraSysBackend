const Course = require("../Models/Course");
const Lecturer = require("../Models/Lecturer");
const mongoose = require("mongoose");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
  });
};

// 📌  Create a New Course
const registerCourse = async (req, res, next) => {
  try {
    const { name, description, lecturer, category, duration } = req.body;

    // Enhanced validation
    const errors = [];
    if (!name) errors.push("Course name is required");
    if (!description) errors.push("Description is required");
    if (!lecturer) errors.push("Lecturer is required");
    if (!category) errors.push("Category is required");
    if (!duration) errors.push("Duration is required");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // Lecturer lookup - more robust checking
    let lecturerDoc;
    try {
      if (mongoose.Types.ObjectId.isValid(lecturer)) {
        lecturerDoc = await Lecturer.findById(lecturer);
      } else {
        lecturerDoc = await Lecturer.findOne({
          $or: [{ name: lecturer }, { email: lecturer }],
        });
      }

      if (!lecturerDoc) {
        return res.status(404).json({
          success: false,
          error: "Lecturer not found",
          details: `No lecturer matching: ${lecturer}`,
        });
      }
    } catch (lecturerError) {
      console.error("Lecturer lookup failed:", lecturerError);
      return res.status(500).json({
        success: false,
        error: "Lecturer lookup failed",
        details: lecturerError.message,
      });
    }

    // Course creation
    const newCourse = new Course({
      name,
      description,
      lecturer: lecturerDoc._id,
      category,
      duration: Number(duration),
    });

    await newCourse.save();

    // Populate response
    const populatedCourse = await Course.findById(newCourse._id)
      .populate("lecturer", "name email")
      .lean();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("Course creation failed:", error);
    next(error); // Pass to error handler middleware
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
