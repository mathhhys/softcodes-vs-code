// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATDY_4GBjcMSUZf-XzvEdx5ub7us1aAG0",
  authDomain: "softcodes-28ea4.firebaseapp.com",
  databaseURL: "https://softcodes-28ea4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "softcodes-28ea4",
  storageBucket: "softcodes-28ea4.appspot.com",
  messagingSenderId: "94087363770",
  appId: "1:94087363770:web:f83b301a9b51fb8a481683",
  measurementId: "G-E99VX3TT36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);