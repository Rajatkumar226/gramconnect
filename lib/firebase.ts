import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCCjUxaa007N4MvOYEXjgM5RrvinEhn_Dg",
  authDomain: "gramconnect-5a7e8.firebaseapp.com",
  projectId: "gramconnect-5a7e8",
  storageBucket: "gramconnect-5a7e8.firebasestorage.app",
  messagingSenderId: "1013502575304",
  appId: "1:1013502575304:web:a188508f855c787bc61bfd",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db  = getFirestore(app);
export const auth = getAuth(app);
