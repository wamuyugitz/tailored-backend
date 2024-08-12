const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const courseSchema = new mongoose.Schema({
  courseTitle: { type: String, required: true },
  courseCode: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  level: { type: String, required: true },
  instructorName: { type: String, required: true },
  duration: { type: String, required: true },
  startDate: { type: Date, required: true },
  certificatesOffered: { type: String, required: true },
  noOfLessons: { type: Number, required: true },
  lessons: { type: [lessonSchema], required: true },
  introVideoLink: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);
