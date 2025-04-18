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
app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
