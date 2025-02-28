import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/LeaderboardPage.css";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { roomNo } = useParams();
  const location = useLocation();
  const currentQuestionIndex = location.state?.currentQuestion || 0;
  const totalQuestions = location.state?.totalQuestions || 1;
  const [leaderboard, setLeaderboard] = useState([]);
  const [timer, setTimer] = useState(7);
  const [quizCompleted , setQuizCompleted] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      if (!roomNo) {
        console.error("❌ Error: roomNo is missing!");
        return;
      }
  
      const response = await axios.get(`https://kahoot-etzm.onrender.com/api/quizzes/leaderboard/${roomNo}`);
      console.log("✅ Leaderboard Data:", response.data);
      setLeaderboard(response.data);
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error.response?.data || error.message);
    }
  };
  
  // ✅ Fetch leaderboard when the quiz ends
  useEffect(() => {
    fetchLeaderboard();
  }, [roomNo]);
  

  useEffect(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      setTimeout(() => {
        navigate(`/quiz/${roomNo}`, { 
          state: { currentQuestion: currentQuestionIndex + 1, totalQuestions } 
        });
      }, 7000);

      return () => clearInterval(countdown);
    }
    else {
      // ✅ Mark quiz as completed once the final leaderboard appears
      axios.put(`https://kahoot-etzm.onrender.com/api/quizzes/complete/${roomNo}`)
        .then(() => {
          console.log("✅ Quiz marked as completed");
          setQuizCompleted(true);
        })
        .catch((error) => console.error("❌ Error marking quiz as completed:", error));
    }
  }, [navigate, currentQuestionIndex, roomNo, totalQuestions]);

  return (
    <div className="leaderboard-background">
      <div className="leaderboard-container">
        <h2 className="leaderboard-title">Leaderboard (Room: {roomNo})</h2>
        <div className="leaderboard-list">
          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => (
              <div key={index} className="leaderboard-item">
                <span>{player.username}</span> <strong>{player.score} pts</strong>
              </div>
            ))
          ) : (
            <p>No players yet.</p>
          )}
        </div>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <p className="leaderboard-info">Next question in ⏳ {timer}s...</p>
        ) : (
          <button className="home-button" onClick={() => navigate("/")}>
            🏠 Go to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
