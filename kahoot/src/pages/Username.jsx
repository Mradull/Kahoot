import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Username = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const _id = localStorage.getItem("_id");

    if (!_id) {
      console.error("❌ Error: User ID not found in localStorage!");
      alert("User ID missing. Please log in again.");
      return;
    }
    console.log("🔹 Updating Username for User ID:", _id);
  
    try {
      const response = await axios.put("http://localhost:5000/auth/update-username", {
        _id,
        username,
      });
  
      console.log("✅ Username updated:", response.data);
      navigate("/login"); // ✅ Now go to login page after setting username
    } catch (error) {
      console.error("❌ Error updating username:", error.response?.data || error.message);
    }
  };
  

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Choose a Username</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" className="auth-input" placeholder="Enter your username" onChange={(e) => setUsername(e.target.value)} required />
          <button type="submit" className="auth-button">Continue</button>
        </form>
      </div>
    </div>
  );
};

export default Username;
