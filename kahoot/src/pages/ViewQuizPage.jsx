import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCopy, FaShareAlt, FaTrash, FaClock } from "react-icons/fa";
import axios from "axios";
import "../styles/ViewQuizPage.css"; // Importing external CSS
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ViewQuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [schedulingQuiz, setSchedulingQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const navigate = useNavigate();

  // ✅ Track authentication state
  useEffect(() => {
    const auth = getAuth();
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("User is not authenticated. Please log in.");
        setLoading(false);
        return;
      }
  
      console.log("✅ Logged-in User:", user);
      const token = await user.getIdToken();
      console.log("✅ Firebase Token:", token);
  
      try {
        const response = await axios.get(
          "http://localhost:5000/api/quizzes/my-quizzes",
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setQuizzes(Array.isArray(response.data) ? response.data : []);
        console.log("✅ API Response:", response.data); // Debugging
        setError("");
      } catch (error) {
        console.error("🚨 Error fetching quizzes:", error);
        setError(error.response?.data?.message || "Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  // ✅ Handle setting a future start time
  const scheduleQuiz = async (quiz) => {
    if (!selectedTime) {
      alert("Please select a start time before scheduling.");
      return;
    }
  
    const quizStartTime = new Date(selectedTime);
    const nowUTC = Date.now();
    const timeDifference = Math.floor((quizStartTime.getTime() - nowUTC) / 1000);
  
    if (timeDifference <= 0) {
      alert("Please select a future time.");
      return;
    }
  
    console.log("✅ Setting quiz start time to:", quizStartTime);
  
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        alert("You must be logged in to schedule a quiz.");
        return;
      }
  
      // ✅ Get Firebase ID token
      const token = await user.getIdToken(); 
  
      // ✅ Now send the PATCH request with the token
      await axios.patch(
        `http://localhost:5000/api/quizzes/update/${quiz._id}`,
        { startTime: quizStartTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setSchedulingQuiz(quiz._id);
      setTimeLeft(timeDifference);
    } catch (error) {
      console.error("❌ Error scheduling quiz:", error.response?.data || error.message);
    }
  };
  


  useEffect(() => {
    if (schedulingQuiz && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            navigate(`/quiz/${schedulingQuiz}`); // ✅ Redirect to quiz when countdown ends
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(interval); // ✅ Cleanup interval on unmount
    }
  }, [schedulingQuiz, timeLeft, navigate]);

  // ✅ Copy quiz link to clipboard
  const copyToClipboard = (roomCode) => {
    const quizLink = `http://localhost:3000/join-quiz?code=${roomCode}`;
    navigator.clipboard.writeText(quizLink);
    alert("Quiz link copied to clipboard!");
  };

  // ✅ Delete quiz from MongoDB
  const deleteQuiz = async (quizId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to delete a quiz.");
        return;
      }

      const token = await user.getIdToken();

      await axios.delete(`http://localhost:5000/api/quizzes/delete/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
    } catch (error) {
      console.error("🚨 Error deleting quiz:", error);
      alert("Failed to delete quiz.");
    }
  };

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Your Quizzes</h1>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && quizzes.length === 0 ? (
        <p className="no-quizzes">No quizzes available.</p>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz._id} className="quiz-card">
            <h2 className="quiz-card-title">{quiz.quizTitle}</h2>
            <p className="quiz-room-code">
              Room Code: <span>{quiz.roomId}</span>
            </p>
            <p className={`quiz-status ${quiz.status === "Completed" ? "completed" : "active"}`}>
      Status: {quiz.status}
    </p>

            <div className="quiz-actions">
              <button className="quiz-start-btn" onClick={() => navigate(`/quiz/${quiz.roomId}`)}>
                Start Quiz
              </button>

              <div>
    <input type="datetime-local" onChange={(e) => setSelectedTime(e.target.value)} />
    <button onClick={() => scheduleQuiz(quiz)}>
      <FaClock /> Schedule
    </button>
  </div>

              <div className="quiz-icons">
                <button className="quiz-icon-btn" onClick={() => copyToClipboard(quiz.roomId)}>
                  <FaCopy className="quiz-icon" />
                </button>
                <button className="quiz-icon-btn">
                  <FaShareAlt className="quiz-icon" />
                </button>
                <button className="quiz-delete-btn" onClick={() => deleteQuiz(quiz._id)}>
                  <FaTrash className="quiz-icon" />
                </button>
              </div>

              {schedulingQuiz === quiz._id && (
                <p className="waiting-message">
                  Waiting for quiz to start at {new Date(quiz.startTime).toLocaleTimeString()}...
                </p>
              )}

            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewQuizPage;
