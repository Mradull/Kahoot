import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import axios from "axios";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("🔹 Sending login request for:", email);
      const response = await axios.post("http://localhost:5000/auth/login", { email, password });

      console.log("✅ Login successful:", response.data);
      localStorage.setItem("uid", response.data.user.uid);
      localStorage.setItem("token", response.data.token);  // ✅ Save token
      localStorage.setItem("username", response.data.user.username);
      window.location.href = "/";  // ✅ Store username
      navigate("/");  // ✅ Redirect to home page after login
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error.message);
      alert(error.response?.data?.msg || "Login failed. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log("🔹 Initiating Google Sign-In");
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
  
      console.log("✅ Google Sign-In successful, sending token to backend...");
      const response = await axios.post("http://localhost:5000/auth/google-login", { token });
  
      console.log("✅ Google Login successful:", response.data);
      localStorage.setItem("token", response.data.jwtToken);
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error.response?.data || error.message);
      alert("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="button-group">
            <button type="submit" className="auth-button">Login</button>
            <button type="button" className="google-button" onClick={handleGoogleLogin}>
              Sign in with Google
            </button>
          </div>
        </form>
        <p className="auth-link">
          Don't have an account? <span onClick={() => navigate("/register")} className="auth-span">Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
