import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    profilePicture: "",
    quizCount: 0,
  });

  const [newUsername, setNewUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);
        setNewUsername(response.data.username);
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        setError("Failed to fetch profile.");
      }
    };

    fetchProfile();
  }, []);

  const handleUsernameUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/user/update-username",
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, username: newUsername }));
      setSuccess("Username updated successfully!");
    } catch (error) {
      setError("Failed to update username.");
    }
  };

  const handleImageUpload = async (e) => {
    const formData = new FormData();
    formData.append("profilePicture", e.target.files[0]);

    try {
      const token = localStorage.getItem("token");

      console.log("📌 Sending Token :)", token); // Debugging
      const response = await axios.post("http://localhost:5000/api/user/upload-profile-picture", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setProfile((prev) => ({ ...prev, profilePicture: response.data.profilePicture }));
    } catch (error) {
      setError("Failed to upload profile picture.");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <label htmlFor="profile-upload" className="profile-avatar">
          {profile.profilePicture ? (
            <img src={`http://localhost:5000/uploads/${profile.profilePicture}`} alt="Profile" />
          ) : (
            <FaUserCircle size={120} />
          )}
        </label>
        <input type="file" id="profile-upload" accept="image/*" onChange={handleImageUpload} />

        <h2 className="profile-username">{profile.username}</h2>
        <p className="profile-email">{profile.email}</p>
        <p className="profile-quizzes">Quizzes Created: {profile.quizCount}</p>

        <input type="text" className="profile-input" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
        <button onClick={handleUsernameUpdate}>Update Username</button>
      </div>
    </div>
  );
};

export default ProfilePage;
