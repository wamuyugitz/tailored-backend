const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/tailored";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
const usersRoutes = require("./routes/users");
const studentsRoutes = require("./routes/students");
const coursesRoutes = require("./routes/courses");
const courseContentsRoutes = require("./routes/courseContents");
const helpSupportRoutes = require("./routes/helpSupport");
const tutorsRoutes = require("./routes/tutors");
const overviewRoutes = require("./routes/overview");
const instructorsRoute = require("./routes/instructors");
const assignmentsRoutes = require("./routes/assignments");

app.use("/api/tutors", tutorsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/course-contents", courseContentsRoutes);
app.use("/api/help-support", helpSupportRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/instructors", instructorsRoute);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
