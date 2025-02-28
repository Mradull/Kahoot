import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDLLhe-IgZJHx1Th7L3i9L9OL0FkJt76T0",
  authDomain: "quizapp-e3e4e.firebaseapp.com",
  projectId: "quizapp-e3e4e",
  storageBucket: "quizapp-e3e4e.firebasestorage.app",
  messagingSenderId: "437958747064",
  appId: "1:437958747064:web:f544fe52b6337f7234254d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
