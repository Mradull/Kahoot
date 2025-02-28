import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../styles/JoinQuiz.css";

export default function JoinQuiz() {
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [waitingTime, setWaitingTime] = useState(null);
  const navigate = useNavigate();

  // ✅ Redirect if user is not logged in (Check Firebase Auth)
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
  }, [navigate]);

  // ✅ Handle joining a quiz
  const handleJoin = async () => {
    if (!quizCode) {
      setError("Please enter a valid quiz code.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to join a quiz.");
        return;
      }

      const token = await user.getIdToken();

      // ✅ Fetch quiz details
      const response = await axios.get(
        `https://kahoot-etzm.onrender.com/api/quizzes/room/${quizCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const quiz = response.data;
      const now = new Date();
      const startTime = new Date(quiz.startTime);

      // ✅ If quiz starts in the future, show waiting screen
      if (now < startTime) {
        setWaitingTime(Math.floor((startTime - now) / 1000)); // Convert to seconds

        const interval = setInterval(() => {
          setWaitingTime((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              navigate(`/quiz/${quizCode}`, { state: { roomId: quizCode } });
            }
            return prev - 1;
          });
        }, 1000);

        return;
      }

      // ✅ If quiz has already started, go to quiz page
      navigate(`/quiz/${quizCode}`, { state: { roomId: quizCode } });
    } catch (error) {
      console.error("❌ Quiz join error:", error.response?.data || error.message);
      setError("Invalid quiz code or quiz not found.");
    }
  };

  return (
    <div className="joinquiz-background">
      <div className="joinquiz-header">Join a Quiz</div>
      <div className="joinquiz-instructions">
        Enter the quiz code provided by your instructor or host to join the quiz.
      </div>

      {error && <p className="error-message">{error}</p>}

      {waitingTime !== null ? (
        <div className="waiting-screen">
          <p className="waiting-message">The quiz starts in {waitingTime} seconds...</p>
        </div>
      ) : (
        <div className="quiz-code-input-wrapper">
          <input
            type="text"
            className="quiz-code-input"
            placeholder="Enter Quiz Code"
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value)}
          />
          <button className="join-button" onClick={handleJoin}>
            Join Quiz
          </button>
        </div>
      )}
    </div>
  );
}
