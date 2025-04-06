const express = require("express");
const {
  registerLecturer,
  loginLecturer,
  getAllLecturers,
  getLecturer,
  logoutLecturer,
  updateLecturer,
  deleteLecturer,
} = require("../Controllers/LecturerController");

const router = express.Router();

router.post("/register", registerLecturer);
router.post("/login", loginLecturer);
router.post("/logout", logoutLecturer);
router.get("/", getAllLecturers);
router.get("/:id", getLecturer);
router.put("/:id", updateLecturer);
router.delete("/:id", deleteLecturer);

module.exports = router;
