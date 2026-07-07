import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyC6K05O9oGe4HlxjoStfoLBNj_4C3aLAVg",
  authDomain: "genuine-ellipse-dnn32.firebaseapp.com",
  projectId: "genuine-ellipse-dnn32",
  storageBucket: "genuine-ellipse-dnn32.firebasestorage.app",
  messagingSenderId: "387279144404",
  appId: "1:387279144404:web:7f46b37b55346d218b8241"
};

let db: any = null;
let isFirebaseConnected = false;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  // Use the specific firestoreDatabaseId: "ai-studio-fd727b80-2dfa-4d3c-b3f4-167032281bb5" if specified
  // Otherwise default
  db = getFirestore(app);
  isFirebaseConnected = true;
  console.log("Firebase initialized successfully with project genuine-ellipse-dnn32");
} catch (error) {
  console.error("Firebase initialization failed, falling back to local storage:", error);
}

export { db, isFirebaseConnected };
