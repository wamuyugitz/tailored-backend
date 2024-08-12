const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// Helper function to generate the next course code
const generateCourseCode = async () => {
  const lastCourse = await Course.findOne().sort({ courseCode: -1 });
  let lastCode = lastCourse ? lastCourse.courseCode : "A00000";

  let nextCode = (parseInt(lastCode.slice(1), 36) + 1)
    .toString(36)
    .toUpperCase()
    .padStart(5, "0");

  return `A${nextCode}`;
};

// Endpoint to generate the next course code
router.get("/generateCode", async (req, res) => {
  try {
    let courseCode;
    let isUnique = false;

    while (!isUnique) {
      courseCode = await generateCourseCode();
      const existingCourse = await Course.findOne({ courseCode });
      isUnique = !existingCourse;
    }

    res.status(200).json({ courseCode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(200).json(courses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get the specific course by ID
router.get("/course-read/:id", async (req, res) => {
  console.log("Request received for ID:", req.params.id); // Log ID
  console.log("Full Request:", req); // Log the entire request object if necessary

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log("Course not found"); // Log if course not found
      return res.status(404).json({ message: "Course not found" });
    }
    console.log("Course found:", course); // Log the found course
    res.status(200).json(course);
  } catch (err) {
    console.log("Error:", err); // Log any errors
    res.status(400).json({ message: err.message });
  }
});

// Add a new course
router.post("/", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    // Ensure courseCode is set
    if (!req.body.courseCode) {
      const generatedCode = await generateCourseCode();
      console.log("Generated code:", generatedCode);
      req.body.courseCode = generatedCode;
    }

    console.log("Final courseCode:", req.body.courseCode);

    // Check for existing course with the same code
    const existingCourse = await Course.findOne({
      courseCode: req.body.courseCode,
    });
    if (existingCourse) {
      return res.status(400).json({ message: "Duplicate course code" });
    }

    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error("Error adding course:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a course
router.put("/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific lesson's title and content based on course ID and lesson title
router.get("/course/:courseId/lesson/:lessonTitle", async (req, res) => {
  console.log("working");
  try {
    const { courseId, lessonTitle } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      console.log("Course not found");
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the lesson by title
    const lesson = course.lessons.find(
      (lesson) => lesson.title === decodeURIComponent(lessonTitle)
    );

    if (!lesson) {
      console.log("Lesson not found");
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json(lesson);
  } catch (err) {
    console.error("Error:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
