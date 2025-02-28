import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import axios from "axios";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username , setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Firebase User Created:", user.uid);
      
      // ✅ Send UID to backend
      const response = await axios.post("https://kahoot-etzm.onrender.com/auth/register", {
        email,password,username
      });
  
      if (response.data._id) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("_id", response.data._id);
  
        // ✅ Double-check if userId is stored
        console.log("📌 Stored userId in localStorage:", localStorage.getItem("_id"));
  
        navigate("/username");
      } else {
        console.error("❌ Error: userId is missing in response from backend.");
      }
    } catch (error) {
      console.error("❌ Registration Error:", error.message);
    }
  };
  
  
  

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="auth-input"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">Register</button>
        </form>
        <p className="auth-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="auth-span">
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
