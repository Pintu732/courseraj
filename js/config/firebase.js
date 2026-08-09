import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjQlaJqnl0IYSph7qVFSrN5icZtwzcwDY",
  authDomain: "skillvault-rajeeb.firebaseapp.com",
  projectId: "skillvault-rajeeb",
  storageBucket: "skillvault-rajeeb.firebasestorage.app",
  messagingSenderId: "736105036244",
  appId: "1:736105036244:web:28250315ce5cdf64d67e41",
  measurementId: "G-ZM85BXFSBC"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
