import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css"; // Create a new CSS file for the dashboard

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-background">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Welcome to Your Dashboard</h1>
        <div className="dashboard-buttons">
          <button
            className="dashboard-button"
            onClick={() => navigate("/create-quiz")}
          >
            Create a Quiz
          </button>
          <button
            className="dashboard-button"
            onClick={() => navigate("/my-quizzes")}
          >
            View My Quizzes
          </button>
        </div>
      </div>
    </div>
  );
}
