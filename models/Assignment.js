const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  choices: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const assignmentSchema = new mongoose.Schema({
  multimediaLinks: [{ type: String }],
  questions: [questionSchema],
  selectedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  selectedLesson: { type: mongoose.Schema.Types.ObjectId, required: true }, // Store lesson ID
});

module.exports = mongoose.model("Assignment", assignmentSchema);
