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

// 1. CORS should be at the top before routes
app.use(
  cors({
    origin: true, // Allow all origins (tighten for production)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly allow OPTIONS
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Middleware
app.use(express.json());
app.use(morgan("dev"));

// 3. Routes
app.use("/users", userRoutes);
app.use("/lecturers", lecturerRoutes);
app.use("/courses", CourseRoutes);
app.use("/grades", GraddeRoutes);

// 4. MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// 5. Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// 6. Error Handling Middleware (should be after routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
