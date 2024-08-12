const mongoose = require("mongoose");

const courseContentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  lessonNumber: { type: Number, required: true },
  lessonContent: { type: String, required: true },
  multimedia: { type: String },
});

module.exports = mongoose.model("CourseContent", courseContentSchema);
