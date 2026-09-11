import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpIWYV7WHhllHW99L3fsnYa3XgPhCITWo",
  authDomain: "alaa-khedr-portfolio.firebaseapp.com",
  projectId: "alaa-khedr-portfolio",
  storageBucket: "alaa-khedr-portfolio.firebasestorage.app",
  messagingSenderId: "125505421969",
  appId: "1:125505421969:web:47664bae6a026c6e3c7530",
  measurementId: "G-JT5Z509341"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
