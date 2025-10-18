// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMAez22AIZ8ca6lgigenTNTzPXjtYZZH0",
  authDomain: "ai-interview-c057c.firebaseapp.com",
  projectId: "ai-interview-c057c",
  storageBucket: "ai-interview-c057c.firebasestorage.app",
  messagingSenderId: "925811455775",
  appId: "1:925811455775:web:f0e2812d55b1ef14a2e22a",
  measurementId: "G-RD8E62E45Z"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);