// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔑 Replace these values with your Firebase console config
const firebaseConfig = {
  apiKey: "AIzaSyDCiq5guzSKGdF3yLBWbAwMVbFyA6Bc9KA",
  authDomain: "task-mg.firebaseapp.com",
  projectId: "task-mg",
  storageBucket: "task-mg.firebasestorage.app",
  messagingSenderId: "640533680770",
  appId: "1:640533680770:web:22f15a45a4ddce80ceda9b",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
