require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./Routes/UserRoute");
const lecturerRoutes = require("./Routes/LecturerRoute");
const CourseRoutes = require("./Routes/CourseRoute");
const GraddeRoutes = require("./Routes/GradeRoute");

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/users", userRoutes);
app.use("/lecturers", lecturerRoutes);
app.use("/courses", CourseRoutes);
app.use("/grades", GraddeRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Sample Route
app.get("/", (req, res) => {
  res.send("Backend is Running!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

app.use(
  cors({
    origin: true, // Allow all origins (tighten for production)
    credentials: true,
  })
);