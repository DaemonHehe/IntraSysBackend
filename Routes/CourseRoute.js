const express = require("express");
const {
  registerCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  searchCourses,
} = require("../Controllers/CourseController");

const router = express.Router();

router.get("/search", searchCourses);
router.post("/create", registerCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
