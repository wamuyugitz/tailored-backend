const express = require("express");
const router = express.Router();
const CourseContent = require("../models/CourseContent");

// Add Course Content
router.post("/", async (req, res) => {
  try {
    const courseContent = new CourseContent(req.body);
    await courseContent.save();
    res.status(201).json(courseContent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit Course Content
router.put("/:id", async (req, res) => {
  try {
    const courseContent = await CourseContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!courseContent)
      return res.status(404).json({ message: "Course Content not found" });
    res.json(courseContent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
