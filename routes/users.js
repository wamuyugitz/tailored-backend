const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Admin = require("../models/Admin");
const Tutor = require("../models/Tutor");
const Student = require("../models/Student");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

require("dotenv").config();

// Route: POST /api/users/signup
router.post("/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    institution,
    role,
    county,
    grade,
  } = req.body; // Include county and grade

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      institution,
      role, // Add role to user creation
      county, // Add county to user creation
      grade, // Add grade to user creation
    });

    // Save user to database
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists in the User collection
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Initialize a variable to store the ID to be used for login
    let userId;

    // Check if the user is an admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      // If the user is an admin, use the User ID for login and update the role
      userId = user.id;
      if (user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }
    }

    // Check if the user is a tutor
    const tutor = await Tutor.findOne({ email });
    if (tutor) {
      // If the user is a tutor, use the User ID for login and update the role
      userId = user.id;
      if (user.role !== "tutor") {
        user.role = "tutor";
        await user.save();
      }
    }

    // If the user is neither an admin nor a tutor, handle the Student collection
    if (!admin && !tutor) {
      let student = await Student.findOne({ email });

      if (!student) {
        // If the student doesn't exist, create a new student entry
        student = new Student({
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          address: user.address || "",
          city: user.county || "",
          school: user.school || "",
          grade: user.grade || "",
          dateOfBirth: "", // Set as empty string
          gender: "", // Set as empty string
          parentName: "", // Set as empty string
          parentContactNumber: "", // Set as empty string
          status: "", // Set as empty string
        });

        await student.save();
      }

      // Set userId to the ID from the Student collection
      userId = student.id;
    }

    console.log("ID used for login: " + userId);

    // Create the JWT payload using the appropriate ID (admin, tutor, or student)
    const payload = {
      user: {
        id: userId, // Use the student/admin/tutor ID for the token
      },
    };

    // Sign the token and send it back in the response
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Use the secret from environment variables
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
          user: {
            ...user._doc,
            id: userId, // Include the ID used for the token in the response
          },
        });
      }
    );
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).send("Server Error");
  }
});

// Route: POST /api/users/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Create a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Send email
    const resetUrl = `http://localhost:3000/registration/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    res.status(200).json({ message: "Email sent" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Reset Password Route
router.put("/reset-password/:resetToken", async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Logging to debug the token and expiration
    console.log("Received Reset Password Token:", resetToken);
    console.log("Hashed Token:", resetPasswordToken);
    console.log("Current Time:", Date.now());

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid or expired token.");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/verify-reset-token/:resetToken", async (req, res) => {
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (err) {
    console.error("Error verifying token:", err.message);
    res.status(500).send("Server Error");
  }
});

// Fetch user details
router.get("/fetch/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Update user details
router.put("/update/:id", async (req, res) => {
  const { fullName, email, address, city, school, grade, dateOfBirth, gender } =
    req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const [firstName, lastName] = fullName.split(" ");
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.address = address;
    user.city = city;
    user.school = school;
    user.grade = grade;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
