const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  logoutUser,
  updateUser,
  deleteUser,
} = require("../Controllers/UserController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
