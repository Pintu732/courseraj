import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjQlaJqnl0IYSph7qVFSrN5icZtwzcwDY",
  authDomain: "skillvault-rajeeb.firebaseapp.com",
  projectId: "skillvault-rajeeb",
  storageBucket: "skillvault-rajeeb.firebasestorage.app",
  messagingSenderId: "736105036244",
  appId: "1:736105036244:web:28250315ce5cdf64d67e41",
  measurementId: "G-ZM85BXFSBC"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const ADMIN_EMAIL = "vovanew76@gmail.com";
