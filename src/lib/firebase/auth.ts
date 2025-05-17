import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider, // For Apple
  PhoneAuthProvider,
  RecaptchaVerifier,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  type User,
} from "firebase/auth";
import { auth, db } from "./config";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

// Ensure window is defined for RecaptchaVerifier
if (typeof window !== 'undefined') {
  (window as any).recaptchaVerifier = null; 
}

export const signUpWithEmail = async (email: string, password_1: string, displayName?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password_1);
  if (userCredential.user && displayName) {
    await updateFirebaseProfile(userCredential.user, { displayName });
  }
  // The onNewUserCreate Firebase Function will handle Firestore document creation.
  // We might want to update lastLoginAt here if the function doesn't.
  // For now, relying on the function.
  return userCredential;
};

export const signInWithEmail = async (email: string, password_1: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password_1);
  if (userCredential.user) {
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastLoginAt: serverTimestamp(),
    });
  }
  return userCredential;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  // The onNewUserCreate Firebase Function will handle Firestore document creation for new users.
  // For existing users, update lastLoginAt
  if (result.user) {
     // Check if it's a new user by checking the creation time and last sign-in time.
    // This is a heuristic. A more robust way is if Firebase Functions sets a flag on initial creation.
    const metadata = result.user.metadata;
    if (metadata.creationTime !== metadata.lastSignInTime) {
         await updateDoc(doc(db, "users", result.user.uid), {
            lastLoginAt: serverTimestamp(),
         });
    }
  }
  return result;
};

export const signInWithApple = async () => {
  const provider = new OAuthProvider('apple.com');
  // You may need to add scopes for Apple Sign In
  // provider.addScope('email');
  // provider.addScope('name');
  const result = await signInWithPopup(auth, provider);
  if (result.user) {
    const metadata = result.user.metadata;
    if (metadata.creationTime !== metadata.lastSignInTime) {
         await updateDoc(doc(db, "users", result.user.uid), {
            lastLoginAt: serverTimestamp(),
         });
    }
  }
  return result;
};

export const setupRecaptcha = (containerId: string) => {
  if (typeof window !== 'undefined') {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });
    }
    return (window as any).recaptchaVerifier;
  }
  return null;
};


export const signInWithPhoneNumber = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  const phoneProvider = new PhoneAuthProvider(auth);
  return await phoneProvider.verifyPhoneNumber(phoneNumber, appVerifier);
};


export const signOutUser = async () => {
  await signOut(auth);
};

export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const updateUserFirebaseProfile = async (user: User, displayName?: string, photoURL?: string) => {
  const profileUpdate: { displayName?: string, photoURL?: string } = {};
  if (displayName) profileUpdate.displayName = displayName;
  if (photoURL) profileUpdate.photoURL = photoURL;
  
  if (Object.keys(profileUpdate).length > 0) {
    await updateFirebaseProfile(user, profileUpdate);
  }
};
