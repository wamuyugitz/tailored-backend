const mongoose = require("mongoose");

const TutorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  courses: { type: String, required: true }, // Or use an array if multiple courses
  grade: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tutor", TutorSchema);
