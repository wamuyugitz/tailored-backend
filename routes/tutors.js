const express = require("express");
const router = express.Router();
const Tutor = require("../models/Tutor");

// Add Tutor
router.post("/", async (req, res) => {
  try {
    const tutor = new Tutor(req.body);
    await tutor.save();
    res.status(201).json(tutor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit Tutor
router.put("/:id", async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.json(tutor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get All Tutors
router.get("/", async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Tutor by ID
router.get("/:id", async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Tutor
router.delete("/:id", async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndDelete(req.params.id);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.json({ message: "Tutor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
