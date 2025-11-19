// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkVUw3Bybu0Klkk3gqwSV13NtH1lHRl8U",
  authDomain: "journeyly-p100.firebaseapp.com",
  projectId: "journeyly-p100",
  storageBucket: "journeyly-p100.firebasestorage.app",
  messagingSenderId: "205263669102",
  appId: "1:205263669102:web:75dea8a18873fef78de37f",
  measurementId: "G-QEB46W4740"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);