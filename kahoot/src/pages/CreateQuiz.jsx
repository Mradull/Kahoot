import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateQuiz.css"; // Updated CSS file
import { getAuth } from "firebase/auth";

export default function CreateQuiz() {
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "", timeLimit: "10 seconds", points: "Standard" },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (index, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[index].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].answer = value;
    setQuestions(newQuestions);
  };

  const handleTimeLimitChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].timeLimit = value;
    setQuestions(newQuestions);
  };

  const handlePointsChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].points = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: "", timeLimit: "10 seconds", points: "Standard" },
    ]);
  };

  const handleSubmit = async () => {
    if (!quizTitle || questions.some(q => !q.question || !q.answer)) {
      setError("Please fill in all questions and answers.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError("User is not authenticated. Please log in.");
        return;
      }
      const token = await user.getIdToken(); // ✅ Get Firebase ID Token
      const userId = localStorage.getItem("_id");
      if (!userId) {
        setError("User ID missing. Try logging in again.");
        return;
      } 

      const response = await axios.post(
        "http://localhost:5000/api/quizzes/create",
        { quizTitle, questions},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setSuccess(`Quiz created successfully! Room ID: ${response.data.roomId}`);
      setQuizTitle("");  // Clear form after submission
      setQuestions([{ question: "", options: ["", "", "", ""], answer: "", timeLimit: "10 seconds", points: "Standard" }]);
      setError("");
    } catch (error) {
      console.error("Quiz creation error:", error.response?.data || error.message);
      setError("Failed to create quiz. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="create-quiz-container">
      <h1 className="create-quiz-title">Create Your Quiz</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="quiz-main-content">
        {/* Left Section: Quiz Form */}
        <div className="quiz-form">
          <input
            type="text"
            className="quiz-title-input"
            placeholder="Enter Quiz Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />

          {questions.map((question, index) => (
            <div key={index} className="question-container">
              <input
                type="text"
                className="question-input"
                placeholder={`Question ${index + 1}`}
                value={question.question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
              />

              {question.options.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  type="text"
                  className="option-input"
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                />
              ))}

              <input
                type="text"
                className="answer-input"
                placeholder="Correct Answer"
                value={question.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            </div>
          ))}

          <button className="add-question-button" onClick={addQuestion}>
            Add Question
          </button>
          <button className="submit-quiz-button" onClick={handleSubmit}>
            Submit Quiz
          </button>
        </div>

        {/* Right Section: Settings Panel */}
        <div className="quiz-settings-panel">
          <h3>Question Settings</h3>

          {questions.map((question, index) => (
            <div key={index} className="settings-card">
              <label>Time Limit</label>
              <select
                value={question.timeLimit}
                onChange={(e) => handleTimeLimitChange(index, e.target.value)}
              >
                <option>10 seconds</option>
                <option>15 seconds</option>
                <option>20 seconds</option>
              </select>

              <label>Points</label>
              <select
                value={question.points}
                onChange={(e) => handlePointsChange(index, e.target.value)}
              >
                <option>Standard</option>
                <option>Double Points</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
