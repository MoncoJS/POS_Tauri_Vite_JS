import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx8TXpJGQhcJ08o9QqNonoHK1HGqZcexw",
  authDomain: "hopak2-7320e.firebaseapp.com",
  databaseURL: "https://hopak2-7320e-default-rtdb.firebaseio.com",
  projectId: "hopak2-7320e",
  storageBucket: "hopak2-7320e.appspot.com",
  messagingSenderId: "738362440716",
  appId: "1:738362440716:web:417f899fad1f8e588f0229",
  measurementId: "G-C8Y3FCPYPV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
