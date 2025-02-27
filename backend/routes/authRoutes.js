import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import admin from "firebase-admin";
import fs from "fs";
import dotenv from "dotenv";
import { getAuth } from "firebase-admin/auth";
import { v4 as uuidv4 } from "uuid"; 
import mongoose from "mongoose";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();
dotenv.config();

// ✅ Register (Email & Password)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "❌ Email and password are required." });
    }

    // ✅ Check if the user already exists in MongoDB
    let existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists. Please login." });
    }

    // ✅ Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

     // ✅ Generate a unique ObjectId for `_id`
     const userId = new mongoose.Types.ObjectId();

    // ✅ Create new user in MongoDB with hashed password
    const newUser = new User({ email, password: hashedPassword, username: "", quizzes: [] });
    await newUser.save();

    console.log("🆕 New User Registered:", newUser);

     // ✅ Generate JWT token
     const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

     res.status(201).json({ message: "Registration successful", token, _id: newUser._id.toString() });
      } catch (error) {
          console.error("❌ Registration Error:", error);
          res.status(500).json({ message: "Server error", error: error.message });
      }

});



// ✅ Google Login
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "No token provided" });

    // ✅ Verify Google token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    console.log("✅ Google Login Verified:", uid, email);

    // ✅ Check if user exists in MongoDB
    let user = await User.findOne({ uid });

    if (!user) {
      console.log("🆕 Creating new MongoDB user for Google login...");
      user = new User({ uid, email, username: null, quizzes: [] });
      await user.save();
    }

    console.log("✅ MongoDB User Found or Created:", user);

    res.status(200).json({ message: "Google Login successful", user });
  } catch (error) {
    console.error("❌ Google Sign-In Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Update Username
router.put("/update-username", async (req, res) => {
  const { _id, username } = req.body;

  try {
      // ✅ Convert userId to a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Invalid user ID format!" });
      }

      const updatedUser = await User.findByIdAndUpdate(
          _id,
          { username },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ error: "User not found!" });
      }

      res.json({ message: "Username updated successfully", user: updatedUser });
  } catch (error) {
      console.error("❌ Error updating username:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get User by ID
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, "username email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ Get Current User (Auth Check)
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // ✅ Verify JWT
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    // ✅ Fetch user
    const user = await User.findById(decoded.userId, "username email quizzes profilePicture");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("✅ Authenticated user:", user);
    res.json({
      username: user.username,
      email: user.email,
      quizCount: user.quizzes.length,  // ✅ Send quiz count
      profilePicture: user.profilePicture || null,
      quizzes: user.quizzes,  // ✅ Include quizzes array if needed later
    });
  } catch (err) {
    console.error("❌ Auth check error:", err.message);
    res.status(500).json({ error: "Invalid token" });
  }
});



export default router;
