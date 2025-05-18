// src/lib/firebase/config.ts

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
// let storage: FirebaseStorage | null = null;

if (!firebaseConfigValues.apiKey) {
  console.error(
    "Firebase API key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. " +
    "Please set it in your .env.local file and restart your development server. " +
    "Firebase services will not be available."
  );
} else if (
    !firebaseConfigValues.authDomain ||
    !firebaseConfigValues.projectId ||
    !firebaseConfigValues.storageBucket ||
    !firebaseConfigValues.messagingSenderId ||
    !firebaseConfigValues.appId
) {
    console.error(
    "One or more Firebase configuration values are missing. " +
    "Please ensure all NEXT_PUBLIC_FIREBASE_ variables are set in your .env.local file " +
    "and restart your development server. Firebase services may not initialize correctly."
  );
  // Attempt to initialize anyway, Firebase SDK will throw specific errors if critical parts are missing
  try {
    app = !getApps().length ? initializeApp(firebaseConfigValues) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    // storage = getStorage(app);
  } catch (error) {
    console.error("Error initializing Firebase (potentially due to incomplete config):", error);
    app = null;
    auth = null;
    db = null;
    // storage = null;
  }
} else {
  try {
    app = !getApps().length ? initializeApp(firebaseConfigValues) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    // storage = getStorage(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    // Ensure services are null if initialization fails
    app = null;
    auth = null;
    db = null;
    // storage = null;
  }
}

export { app, auth, db /*, storage */ };
export type { FirebaseApp, Auth, Firestore /*, FirebaseStorage */ };
