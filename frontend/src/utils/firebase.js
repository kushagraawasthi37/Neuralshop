import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "loginecommerce-151fa.firebaseapp.com",
  projectId: "loginecommerce-151fa",
  storageBucket: "loginecommerce-151fa.firebasestorage.app",
  messagingSenderId: "935507852051",
  appId: "1:935507852051:web:b5df20bdd6e2c84e4f38e6",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
export { auth, provider };
