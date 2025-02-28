import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JoinQuiz from "./pages/JoinQuiz";
import QuizPage from "./pages/QuizPage";
import CreateQuiz from "./pages/CreateQuiz";
import MyQuiz from "./pages/ViewQuizPage";
import Leaderboard from "./pages/LeaderboardPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Username from "./pages/Username";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/ProfilePage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join-quiz" element={<JoinQuiz />} />
        <Route path="/quiz/:roomNo" element={<QuizPage />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-quizzes" element={<MyQuiz />} />
        <Route path="/leaderboard/:roomNo" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/username" element={<Username />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
