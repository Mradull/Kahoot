import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  quizTitle: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
      answer: { type: String, required: true },
      timeLimit: { type: String, required: true },
      points: { type: String, required: true }
    }
  ],
  userId: { type: String, ref: "User", required: true },
  roomId: { type: String, unique: true, required: true }, // Unique room ID
  createdBy: { type: String, required: true }, // ✅ Change to String
  startTime: { type: Date, required: true }, // ✅ Quiz Start Time (Scheduled or Immediate)
  leaderboard: [{ username: String, score: Number }], // ✅ Add leaderboard field
  status: { type: String, enum: ["Active", "Completed"], default: "Active" }

});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz; // ✅ Use `export default`
