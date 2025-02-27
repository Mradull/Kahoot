import admin from "firebase-admin";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUID = decodedToken.uid;

    // Find the user in MongoDB using email (or Firebase UID if stored)
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    req.user = { id: user._id.toString() }; // Ensure it's stored as a string
    console.log("✅ Authenticated MongoDB User ID:", req.user.id);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

export default authMiddleware;
