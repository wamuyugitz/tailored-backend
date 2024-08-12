const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");
const mongoose = require("mongoose");

// Create a new assignment
router.post("/", async (req, res) => {
  const { selectedCourse, selectedLesson, questions, multimediaLinks } =
    req.body;

  try {
    const assignment = new Assignment({
      selectedCourse,
      selectedLesson,
      questions,
      multimediaLinks,
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error.message);
    res.status(500).send("Server Error");
  }
});

// Get all assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("selectedCourse");

    // Manually add lesson details to each assignment
    const assignmentsWithLessons = await Promise.all(
      assignments.map(async (assignment) => {
        const course = assignment.selectedCourse;
        if (course) {
          const lesson = course.lessons.id(assignment.selectedLesson); // Find lesson by ID
          return {
            ...assignment.toObject(),
            selectedLesson: lesson,
          };
        }
        return assignment;
      })
    );

    res.json(assignmentsWithLessons);
  } catch (error) {
    console.error("Error fetching assignments:", error.message);
    res.status(500).send("Server Error");
  }
});

// Get a specific assignment by ID
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("selectedCourse")
      .populate("selectedLesson");
    if (!assignment) {
      return res.status(404).send("Assignment not found");
    }
    res.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error.message);
    res.status(500).send("Server Error");
  }
});

// Update an assignment by ID
router.put("/:id", async (req, res) => {
  const { selectedCourse, selectedLesson, questions, multimediaLinks } =
    req.body;

  try {
    let assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).send("Assignment not found");
    }

    assignment.selectedCourse = selectedCourse;
    assignment.selectedLesson = selectedLesson;
    assignment.questions = questions;
    assignment.multimediaLinks = multimediaLinks;

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error.message);
    res.status(500).send("Server Error");
  }
});

// Delete an assignment by ID
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).send("Assignment not found");
    }

    await assignment.remove();
    res.json({ message: "Assignment deleted" });
  } catch (error) {
    console.error("Error deleting assignment:", error.message);
    res.status(500).send("Server Error");
  }
});

// Submit an assignment and grade it
router.post("/:id/submit", async (req, res) => {
  console.log(req.body); // For debugging purposes

  try {
    const assignmentId = req.params.id;
    const {
      studentId,
      responses,
      courseTitle,
      courseCode,
      lessonId,
      lessonTitle,
    } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    let correctAnswers = 0;
    const totalQuestions = assignment.questions.length;

    assignment.questions.forEach((question) => {
      if (responses[question._id] === question.correctAnswer) {
        correctAnswers += 1;
      }
    });

    const percentage = (correctAnswers / totalQuestions) * 100;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update student's record with additional data
    student.completedAssignments.push({
      courseTitle,
      courseCode,
      lessonId, // No need for manual ObjectId conversion
      lessonTitle,
      assignmentId, // No need for manual ObjectId conversion
      marks: percentage,
    });

    await student.save();

    res.status(200).json({
      message: "Assignment submitted successfully",
      percentage,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
