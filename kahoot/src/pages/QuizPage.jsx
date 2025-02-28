import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/QuizPage.css";

const QuizPage = () => {
  const { roomNo } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Track current question index
  const currentQuestionIndex = location.state?.currentQuestion || 0;

  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timer, setTimer] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answerSelected, setAnswerSelected] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`https://kahoot-etzm.onrender.com/api/quizzes/room/${roomNo}`);
        setQuiz(response.data);
        setSelectedAnswers(Array(response.data.questions.length).fill(null));
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching quiz:", err);
        setError("Quiz not found.");
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [roomNo]);

  useEffect(() => {
    if (!quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // ✅ Extract the correct timer for the question
    const timeLimitInSeconds = parseInt(currentQuestion.timeLimit.split(" ")[0], 10) || 10;
    setTimer(timeLimitInSeconds);

    // ✅ Start countdown timer
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown); // ✅ Cleanup timer when question changes
  }, [currentQuestionIndex, quiz]);

  // ✅ Show leaderboard after every question, only when timer runs out
  const handleTimeUp = () => {
    if (!quiz) return;

    navigate(`/leaderboard/${roomNo}`, {
      state: { 
        currentQuestion: currentQuestionIndex, 
        totalQuestions: quiz.questions.length
      },
    });
  };

  // ✅ Handle answer selection, but DO NOT navigate immediately
  const handleAnswerSelection = async (index) => {
    if (answerSelected) return; // ✅ Prevent multiple selections

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = index;
    setSelectedAnswers(newAnswers);
    setAnswerSelected(true); // ✅ Mark that an answer was selected

    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const correctAnswerIndex = currentQuestion.options.indexOf(currentQuestion.answer);
    const isCorrect = correctAnswerIndex === index;

    // ✅ Dynamic Points Calculation
    let pointsAwarded = isCorrect ? 100 : 0;
    if (currentQuestion.points === "Double Points") {
      pointsAwarded *= 2;
    }

    try {
      await axios.post("https://kahoot-etzm.onrender.com/api/quizzes/submit-score", {
        roomId: roomNo,
        username: localStorage.getItem("username"),
        score: pointsAwarded,
      });
      console.log("✅ Score submitted!");
    } catch (error) {
      console.error("❌ Error submitting score:", error);
    }

    // ✅ Do NOT navigate immediately, let the timer run out for all users
  };

  if (loading) return <h2>Loading quiz...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">{quiz.quizTitle} (Room: {roomNo})</h1>
      <h2 className="quiz-question">{quiz.questions[currentQuestionIndex].question}</h2>
      <div className="quiz-timer">⏳ {timer}s</div>

      <div className="quiz-options-grid">
        {quiz.questions[currentQuestionIndex].options.map((option, index) => (
          <div
            key={index}
            className={`quiz-option kahoot-color-${index} ${selectedAnswers[currentQuestionIndex] === index ? "selected" : ""}`}
            onClick={() => handleAnswerSelection(index)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;
