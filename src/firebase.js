/* src/firebase.js */

import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDbUJhQrTuS_84WL1-JL-1MwY5W4RdmymI",
  authDomain: "dentalclinic-7df6a.firebaseapp.com",
  projectId: "dentalclinic-7df6a",
  storageBucket: "dentalclinic-7df6a.firebasestorage.app",
  messagingSenderId: "447436931488",
  appId: "1:447436931488:web:1b1da0fd6d6c3f261224c5",
  measurementId: "G-Q4DYS5CEYH"
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
