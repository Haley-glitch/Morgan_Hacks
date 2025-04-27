// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage }      from 'firebase/storage';
import { getFirestore }    from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCudnldSRJ-DDtgtJat-ud_5ljv3hNpV98",
  authDomain: "digitext-cce41.firebaseapp.com",
  projectId: "digitext-cce41",
  storageBucket: "digitext-cce41.firebasestorage.app",
  messagingSenderId: "1046683305876",
  appId: "1:1046683305876:web:8cdbb728f7e5afa10ef181",
  measurementId: "G-YD1C2FV07X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage   = getStorage(app);
export const db      = getFirestore(app);
const analytics = getAnalytics(app);