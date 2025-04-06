const express = require("express");
const {
  registerCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../Controllers/CourseController");

const router = express.Router();

router.post("/create", registerCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
