const express = require("express");

const {
  assignGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  getStudentGrades,
  getCourseGrades,
  deleteGrade,
} = require("../Controllers/GradeController");

const router = express.Router();

router.post("/assign", assignGrade);
router.get("/", getAllGrades);
router.get("/student/:id", getStudentGrades);
router.get("/course/:id", getCourseGrades);
router.get("/:id", getGradeById);
router.put("/:id", updateGrade);
router.delete("/:id", deleteGrade);

module.exports = router;
