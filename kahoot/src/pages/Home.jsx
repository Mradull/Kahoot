import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get("https://kahoot-etzm.onrender.com/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data.username) {
            setUser(response.data);
          } else {
            axios
              .get(`https://kahoot-etzm.onrender.com/auth/user/${response.data.userId}`)
              .then((userRes) => {
                setUser({ ...response.data, username: userRes.data.username });
              })
              .catch((err) => console.error("Error fetching username:", err));
          }
        });
    }
  }, []);

  // Function to handle clicking outside of dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="home-page">
      {/* Login/Profile Section */}
      <div className="login-container">
        {user ? (
          <div className="profile-dropdown" ref={dropdownRef}>
            <div
              className="profile-icon"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle size={30} />
              <span className="username">{user.username || "No Username"}</span>
            </div>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  My Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-button" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="home-content">
        <h1 className="home-title">Kahoot</h1>
        <div className="home-button-container">
          <button
            className="home-button"
            onClick={() => navigate(user ? "/dashboard" : "/login")}
          >
            Create Quiz
          </button>

          <button
            className="home-button"
            onClick={() => navigate(user ? "/join-quiz" : "/login")}
          >
            Join Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
