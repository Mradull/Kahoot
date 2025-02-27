import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
  timeLimit: String,
  points: String,
});

const quizSchema = new mongoose.Schema({
  quizTitle: String,
  roomId: String,  // ✅ Unique Room ID for public access
  startTime: Date,
  status: { type: String, default: "Active" }, // ✅ "Active" or "Completed"
  questions: [questionSchema],
  leaderboard: [
    { username: String, score: Number }
  ]
});

// ✅ Store quizzes inside the User Collection
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, default: null }, 
  profilePicture: { type: String, default: null }, // ✅ Profile Picture Field
  quizzes: [quizSchema],  // ✅ Each user has their own quizzes
});

const User = mongoose.model("User", userSchema);

export default User;
