const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Course name is required"],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Course description is required"],
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecturer",
    required: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  duration: {
    type: Number,
    required: true,
  },
  enrollmentLimit: {
    type: Number,
  },
  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  content: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Course = mongoose.model("Course", CourseSchema);
module.exports = Course;
