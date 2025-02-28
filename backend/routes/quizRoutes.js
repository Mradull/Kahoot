import express from "express";
const router = express.Router();
import Quiz from "../models/Quiz.js"
import {v4 as uuidv4} from "uuid"; // Generate unique room IDs
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAuth } from "firebase-admin/auth"; // ✅ Import getAuth
import User from "../models/User.js";


// Route to create a quiz
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { quizTitle, questions, startTime } = req.body;
    const userId = req.user.id; // Now correctly assigned from middleware

    console.log("🔍 User ID from Middleware:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }


    // Create a new quiz object
    const newQuiz = {
      _id: new mongoose.Types.ObjectId(), // Generate a unique quiz ID
      quizTitle,
      roomId: uuidv4().slice(0, 8), // Generate an 8-character room ID
      startTime: startTime ? new Date(startTime) : new Date(),
      questions,
      status: "Active",
      leaderboard: [],
    };

    user.quizzes.push(newQuiz); // Store inside quizzes array in users collection
    await user.save(); // Save changes in MongoDB

    res.status(201).json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Quiz Creation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.get("/my-quizzes", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // ✅ Find User by Firebase UID

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.quizzes); // ✅ Send only the user's quizzes
  } catch (error) {
    console.error("🚨 Error fetching user's quizzes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.patch("/update/:quizId", authMiddleware, async (req, res) => {
  try {
    const { startTime } = req.body;
    const user = await User.findOne({ "quizzes._id": req.params.quizId });
    if (!user) return res.status(404).json({ message: "Quiz not found" });

    let quiz = user.quizzes.find(q => q._id.toString() === req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found inside user data" });

    quiz.startTime = startTime;
    await user.save();

    res.json({ message: "Quiz start time updated successfully", quiz });
  } catch (error) {
    res.status(500).json({ message: "Failed to update quiz start time" });
  }
});



router.delete("/delete/:quizId", async (req, res) => {
  try {
    let user = await User.findOne({ "quizzes._id": req.params.quizId });
    if (!user) return res.status(404).json({ message: "Quiz not found" });

    user.quizzes = user.quizzes.filter(q => q._id.toString() !== req.params.quizId);
    await user.save();

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete quiz" });
  }
});

// Route to fetch quiz by room ID
router.get("/room/:roomId", async (req, res) => {
  try {
    const user = await User.findOne({ "quizzes.roomId": req.params.roomId });
    if (!user) return res.status(404).json({ message: "Quiz not found" });

    const quiz = user.quizzes.find(q => q.roomId === req.params.roomId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found inside user data" });

    // ✅ Block access if the quiz is already completed
    if (quiz.status === "Completed") {
      return res.status(403).json({ message: "This quiz has ended. You can no longer participate." });
    }

    res.json(quiz);
  } catch (error) {
    console.error("🚨 Error fetching quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Update player score 
router.post("/submit-score", async (req, res) => {
  try {
    const { roomId, username, score } = req.body;

    if (!roomId || !username || score == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the quiz
    let user = await User.findOne({ "quizzes.roomId": roomId });

    if (!user) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let quiz = user.quizzes.find(q => q.roomId === roomId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found inside user data" });
    }

    // Update or add player score
    let playerIndex = quiz.leaderboard.findIndex((p) => p.username === username);
    if (playerIndex !== -1) {
      quiz.leaderboard[playerIndex].score += score;
    } else {
      quiz.leaderboard.push({ username, score });
    }

    // Sort leaderboard and keep only top 5
    quiz.leaderboard.sort((a, b) => b.score - a.score);
    quiz.leaderboard = quiz.leaderboard.slice(0, 5);

    await user.save();

    res.json({ message: "Score updated successfully", leaderboard: quiz.leaderboard });
  } catch (error) {
    console.error("❌ Error updating leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//Fetch Leaderboard score
router.get("/leaderboard/:roomId", async (req, res) => {
  try {
    console.log("📌 Fetching leaderboard for Room ID:", req.params.roomId);
    const user = await User.findOne({ "quizzes.roomId": req.params.roomId });
    if (!user) {
      console.log("❌ Quiz not found for Room ID:", req.params.roomId);
      return res.status(404).json({ message: "Quiz not found" });
    }
    const quiz = user.quizzes.find(q => q.roomId === req.params.roomId);


    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz.leaderboard);
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/complete/:roomId", async (req, res) => {
  try {
    const user = await User.findOne({ "quizzes.roomId": req.params.roomId });
    if (!user) return res.status(404).json({ message: "Quiz not found" });

    const quiz = user.quizzes.find(q => q.roomId === req.params.roomId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found inside user data" });

    quiz.status = "Completed";
    await user.save();

    res.json({ message: "Quiz marked as completed", quiz });
  } catch (error) {
    console.error("❌ Error updating quiz status:", error);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
