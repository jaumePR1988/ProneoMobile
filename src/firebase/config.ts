import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA5DFVjl5Xd7k_TZIEsNf5ZqXlrqAzANuk",
    authDomain: "proneomanager.firebaseapp.com",
    projectId: "proneomanager",
    storageBucket: "proneomanager.firebasestorage.app",
    messagingSenderId: "1039439049102",
    appId: "1:1039439049102:web:e6b90687fb03cd6aab34df",
    measurementId: "G-NYMNXF6GL3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
