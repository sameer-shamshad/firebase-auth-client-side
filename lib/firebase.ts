import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC4QwNDwrS639M5iCPSbalV2n-EjIYslpE",
  authDomain: "ca-firebase-auth-daa08.firebaseapp.com",
  projectId: "ca-firebase-auth-daa08",
  storageBucket: "ca-firebase-auth-daa08.firebasestorage.app",
  messagingSenderId: "579675062266",
  appId: "1:579675062266:web:860c78a9c1b36e89c5ee43",
  measurementId: "G-NMRBP1BXDJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth , app};