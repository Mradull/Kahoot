import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// ✅ Set Up Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

/**
 * ✅ GET /api/user/me
 * Fetch logged-in user's profile
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email quizzes profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      username: user.username,
      email: user.email,
      quizCount: user.quizzes.length,
      profilePicture: user.profilePicture || null,
    });
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ POST /api/user/upload-profile-picture
 * Upload and store profile picture for the logged-in user
 */
router.post("/upload-profile-picture", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    console.log("🔍 Received Token:", req.headers.authorization); // Debugging
    console.log("🔍 Extracted User ID:", req.user.id); // Debugging

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    // ✅ Delete Old Profile Picture If Exists
    if (user.profilePicture) {
      const oldPath = path.join("uploads", user.profilePicture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // ✅ Save New Profile Picture in MongoDB
    user.profilePicture = req.file.filename;
    await user.save();

    res.json({ message: "Profile picture updated!", profilePicture: user.profilePicture });
  } catch (error) {
    console.error("❌ Error uploading profile picture:", error);
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
});

/**
 * ✅ PUT /api/user/update-username
 * Update username of logged-in user
 */
router.put("/update-username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({ error: "Username cannot be empty!" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.json({ message: "✅ Username updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Error updating username:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ✅ PUT /api/user/change-password
 * Change password of logged-in user
 */
router.put("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    // ✅ Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password." });

    // ✅ Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    res.status(500).json({ message: "Failed to change password." });
  }
});

export default router;
