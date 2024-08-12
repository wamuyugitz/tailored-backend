const mongoose = require("mongoose");

const completedAssignmentSchema = new mongoose.Schema({
  courseTitle: { type: String },
  courseCode: { type: String },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }, // Ensure correct type
  lessonTitle: { type: String },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  marks: { type: Number },
});

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  city: { type: String, required: true },
  school: { type: String },
  grade: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  parentName: { type: String },
  parentContactNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "Active" },
  lastLogin: { type: Date },
  totalLoginTime: { type: Number, default: 0 },
  coursesTaken: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  completedCourses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      courseCode: { type: String },
    },
  ],
  completedAssignments: [completedAssignmentSchema],
});

module.exports = mongoose.model("Student", studentSchema);
