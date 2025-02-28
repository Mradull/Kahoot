import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_CREDENTIALS, "utf8"));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors({ 
  origin: ["https://kahoot-iota.vercel.app", "http://localhost:3000"], credentials: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/api/quizzes" , quizRoutes);
app.use("/api/user" , userRoutes);
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
