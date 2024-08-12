// routes/instructors.js

const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin"); // Adjust the path as per your project structure
const Tutor = require("../models/Tutor"); // Adjust the path as per your project structure

// GET /api/instructors
router.get("/", async (req, res) => {
  try {
    // Fetch all admins and tutors
    const admins = await Admin.find({}, "fullName email");
    const tutors = await Tutor.find({}, "fullName email");

    // Combine admins and tutors into one array
    const instructors = [...admins, ...tutors];

    // Send response
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
