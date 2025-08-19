import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDf0DKk3MQKWRAOhH_3S6_wMaXeef0AZI8",
  authDomain: "emailweb-337c5.firebaseapp.com",
  projectId: "emailweb-337c5",
  storageBucket: "emailweb-337c5.firebasestorage.app",
  messagingSenderId: "75757720147",
  appId: "1:75757720147:web:2644b40b0d1c32d5be6ca6",
  measurementId: "G-R1F5H1JR3V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };