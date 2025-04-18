const Course = require("../Models/Course");
const Lecturer = require("../Models/Lecturer");
const mongoose = require("mongoose");

// 📌 Create a New Course
const registerCourse = async (req, res) => {
  try {
    if (!req.is("application/json")) {
      return res.status(415).json({
        error: "Unsupported Media Type",
        message: "Content-Type must be application/json",
      });
    }

    const { name, description, lecturer, category, duration, content } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !lecturer ||
      !category ||
      !duration ||
      !content
    ) {
      return res.status(400).json({
        error: "Validation Error",
        message: "All fields including content are required",
      });
    }

    // Validate content array
    if (!Array.isArray(content) || content.length === 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "At least one content item is required",
      });
    }

    // Validate each content item
    for (const item of content) {
      if (!item.title || !item.url) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Each content item must include a title and url",
        });
      }
    }

    // Lecturer lookup
    const lecturerDoc = await Lecturer.findOne({
      $or: [{ _id: lecturer }, { name: lecturer }, { email: lecturer }],
    });

    if (!lecturerDoc) {
      return res.status(404).json({
        error: "Not Found",
        message: "Lecturer not found",
      });
    }

    // Create and save course
    const course = new Course({
      name,
      description,
      lecturer: lecturerDoc._id,
      category,
      duration,
      content,
    });

    await course.save();

    const populatedCourse = await Course.findById(course._id).populate(
      "lecturer",
      "name email"
    );

    res.status(201).json({
      success: true,
      data: populatedCourse,
    });
  } catch (err) {
    console.error("Course creation error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

// 📌 Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("lecturer", "name email");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get a Single Course by ID
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

// 📌 Update a Course
const updateCourse = async (req, res) => {
  try {
    let { name, description, lecturer, category, duration, content } = req.body;

    // Optional: Validate unique course name
    const existingCourse = await Course.findOne({ name });
    if (existingCourse && existingCourse._id.toString() !== req.params.id) {
      return res.status(400).json({ error: "Course name must be unique" });
    }

    // Resolve lecturer if necessary
    if (lecturer && !mongoose.Types.ObjectId.isValid(lecturer)) {
      const lecturerDoc = await Lecturer.findOne({ name: lecturer });
      if (!lecturerDoc) {
        return res.status(404).json({ error: "Lecturer not found by name" });
      }
      lecturer = lecturerDoc._id;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { name, description, lecturer, category, duration, content },
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

// 📌 Delete a Course
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
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const regexQuery = new RegExp(query, "i");

    const courses = await Course.find({
      $or: [
        { name: { $regex: regexQuery } },
        { description: { $regex: regexQuery } },
        { category: { $regex: regexQuery } },
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
