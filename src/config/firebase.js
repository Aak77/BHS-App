import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD_p4JH7jh3Tx7zAnf8WnzVYMoOJ_5imsE",
  authDomain: "bharat-seeder-app.firebaseapp.com",
  projectId: "bharat-seeder-app",
  storageBucket: "bharat-seeder-app.firebasestorage.app",
  messagingSenderId: "497255438613",
  appId: "1:497255438613:web:8337e023ce1f45b61bf11c",
  measurementId: "G-6JTYP5KDNT",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
