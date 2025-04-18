const Course = require("../Models/Course");
const Lecturer = require("../Models/Lecturer");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

// Helper function to validate content array
const validateContent = (content) => {
  if (!Array.isArray(content)) return false;
  return content.every(
    (item) =>
      item &&
      typeof item.title === "string" &&
      typeof item.url === "string" &&
      item.title.trim() &&
      item.url.trim()
  );
};

// 📌 Create a New Course
const registerCourse = async (req, res) => {
  try {
    // Validate request content type
    if (!req.is("application/json")) {
      return res.status(415).json({
        success: false,
        error: "Unsupported Media Type",
        message: "Content-Type must be application/json",
      });
    }

    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: errors.array(),
      });
    }

    const { name, description, lecturer, category, duration, content } =
      req.body;

    // Validate content structure
    if (!validateContent(content)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Content",
        message: "Content must be an array of objects with title and url",
      });
    }

    // Find lecturer (by ID, name, or email)
    let lecturerDoc;
    try {
      lecturerDoc = await Lecturer.findOne({
        $or: [{ _id: lecturer }, { name: lecturer }, { email: lecturer }],
      }).select("_id name email");

      if (!lecturerDoc) {
        return res.status(404).json({
          success: false,
          error: "Lecturer Not Found",
          message: `No lecturer matching: ${lecturer}`,
        });
      }
    } catch (err) {
      console.error("Lecturer lookup error:", err);
      return res.status(500).json({
        success: false,
        error: "Server Error",
        message: "Failed to lookup lecturer",
      });
    }

    // Create and validate course
    const course = new Course({
      name: name.trim(),
      description: description.trim(),
      lecturer: lecturerDoc._id,
      category: category.trim(),
      duration: Number(duration),
      content: content.map((item) => ({
        title: item.title.trim(),
        url: item.url.trim(),
      })),
    });

    // Manual validation
    const validationError = course.validateSync();
    if (validationError) {
      const errors = {};
      Object.keys(validationError.errors).forEach((key) => {
        errors[key] = validationError.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        error: "Validation Failed",
        details: errors,
      });
    }

    // Save course
    await course.save();

    // Populate and return response
    const populatedCourse = await Course.findById(course._id).populate(
      "lecturer",
      "name email"
    );

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: populatedCourse,
    });
  } catch (err) {
    console.error("Course creation error:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
    });

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

// 📌 Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("lecturer", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    console.error("Get courses error:", err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
      message: "Failed to fetch courses",
    });
  }
};

// 📌 Get Single Course
const getCourseById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID",
        message: "Provided course ID is not valid",
      });
    }

    const course = await Course.findById(req.params.id)
      .populate("lecturer", "name email")
      .populate("enrolledStudents", "name email")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    console.error("Get course error:", err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
      message: "Failed to fetch course",
    });
  }
};

// 📌 Update Course
const updateCourse = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID",
        message: "Provided course ID is not valid",
      });
    }

    const { name, description, lecturer, category, duration, content } =
      req.body;

    // Validate content if provided
    if (content && !validateContent(content)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Content",
        message: "Content must be an array of objects with title and url",
      });
    }

    // Check if course exists
    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Course not found",
      });
    }

    // Resolve lecturer if provided
    let lecturerId = existingCourse.lecturer;
    if (lecturer) {
      const lecturerDoc = await Lecturer.findOne({
        $or: [{ _id: lecturer }, { name: lecturer }, { email: lecturer }],
      });

      if (!lecturerDoc) {
        return res.status(404).json({
          success: false,
          error: "Lecturer Not Found",
          message: `No lecturer matching: ${lecturer}`,
        });
      }
      lecturerId = lecturerDoc._id;
    }

    // Prepare update data
    const updateData = {
      name: name ? name.trim() : existingCourse.name,
      description: description
        ? description.trim()
        : existingCourse.description,
      lecturer: lecturerId,
      category: category ? category.trim() : existingCourse.category,
      duration: duration ? Number(duration) : existingCourse.duration,
      content: content
        ? content.map((item) => ({
            title: item.title.trim(),
            url: item.url.trim(),
          }))
        : existingCourse.content,
    };

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("lecturer", "name email");

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (err) {
    console.error("Update course error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

// 📌 Delete Course
const deleteCourse = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID",
        message: "Provided course ID is not valid",
      });
    }

    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    console.error("Delete course error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete course",
    });
  }
};

// 📌 Search Courses
const searchCourses = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid Query",
        message: "Search query is required and must be a string",
      });
    }

    const regexQuery = new RegExp(query, "i");
    const courses = await Course.find({
      $or: [
        { name: { $regex: regexQuery } },
        { description: { $regex: regexQuery } },
        { category: { $regex: regexQuery } },
        { "lecturer.name": { $regex: regexQuery } },
      ],
    })
      .populate("lecturer", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    console.error("Search courses error:", err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
      message: "Failed to search courses",
    });
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
