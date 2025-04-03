const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  status: {
    type: String,
    enum: ["A", "B", "C", "D", "F", "Pass", "Fail"],
    required: [true, "Status is required"],
  },
  remarks: {
    type: String,
    trim: true,
  },
  gradedAt: {
    type: Date,
    default: Date.now,
  },
});

const Grade = mongoose.model("Grade", GradeSchema);
module.exports = Grade;
