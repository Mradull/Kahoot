import { useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("John Doe"); // Replace with actual user data

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="navbar">
      {isLoggedIn ? (
        <div className="profile">
          <img src="/profile-icon.png" alt="Profile" className="profile-icon" />
          <span>{username}</span>
        </div>
      ) : (
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>
  );
}
