const express = require("express");
const router = express.Router();
const HelpSupport = require("../models/HelpSupport");

// Add Help Support Request
router.post("/", async (req, res) => {
  try {
    const helpSupport = new HelpSupport(req.body);
    await helpSupport.save();
    res.status(201).json(helpSupport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
