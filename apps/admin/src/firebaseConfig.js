
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore



const firebaseConfig = {
  apiKey: "AIzaSyAh07w_6mnUho-FI_KxF6EdZYk_jBuvbKY",
  authDomain: "urbanghar-8dfb3.firebaseapp.com",
  projectId: "urbanghar-8dfb3",
  storageBucket: "urbanghar-8dfb3.firebasestorage.app",
  messagingSenderId: "123060483664",
  appId: "1:123060483664:web:80ddca983ad51ef3ee8355",
  measurementId: "G-SH5PY3DWLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Initialize Firestore