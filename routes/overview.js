const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Get Overview Data
router.get("/", async (req, res) => {
  try {
    // Get the total number of students
    const totalPupils = await Student.countDocuments();

    // Get the number of new students in the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newPupils = await Student.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    res.status(200).json({
      totalPupils,
      newPupils,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
