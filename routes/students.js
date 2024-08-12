const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");

// Fetch All Students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json(students);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add Student
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit Student
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Fetch Active Count
router.get("/active-count", async (req, res) => {
  try {
    const activeStudentCount = await Student.countDocuments({
      status: "Active",
    });
    res.status(200).json({ count: activeStudentCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Overview
router.get("/overview", async (req, res) => {
  try {
    const totalPupils = await Student.countDocuments({});
    const newPupils = await Student.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }); // Example for new pupils in the last 30 days

    res.status(200).json({ totalPupils, newPupils });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch Student Activity
router.get("/:id/activity", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("coursesTaken")
      .exec();

    if (!student) return res.status(404).json({ message: "Student not found" });

    const assignments = await Assignment.countDocuments({
      student: student._id,
      completed: true,
    });

    res.status(200).json({
      totalLoginTime: student.totalLoginTime,
      completedAssignments: assignments,
      coursesTaken: student.coursesTaken.length,
      lastLogin: student.lastLogin,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Completed Courses
router.put("/:id/complete-course", async (req, res) => {
  try {
    const { courseId, courseCode } = req.body;

    console.log("Received courseId:", courseId);
    console.log("Received courseCode:", courseCode);

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          completedCourses: { courseId, courseCode },
        },
      },
      { new: true }
    );

    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("Student updated successfully:", student);
    res.status(200).json(student);
  } catch (err) {
    console.error("Error completing course:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// Fetch Student by Email
router.get("/by-email/:email", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email }).exec();
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ id: student._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id/completed-assignments", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "completedAssignments"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // Make sure that completedAssignments is an array
    if (!Array.isArray(student.completedAssignments)) {
      return res.status(500).json({ message: "Invalid data format" });
    }

    res.json(student.completedAssignments);
    console.log(student.completedAssignments);
  } catch (error) {
    console.error("Error fetching completed assignments:", error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
