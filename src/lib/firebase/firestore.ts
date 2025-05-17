import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./config";
import type { UserProfile } from "@/lib/types";

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as UserProfile;
  } else {
    // This case should ideally be handled by the onNewUserCreate Firebase Function.
    // If the doc doesn't exist, it means the function might have failed or not run yet.
    console.warn(`No profile document found for user ${uid}. Waiting for function trigger or manual creation.`);
    return null; 
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userDocRef = doc(db, "users", uid);
  // Ensure updatedAt is always updated
  const dataToUpdate = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(userDocRef, dataToUpdate);
};

// This function is primarily for the onNewUserCreate Firebase Function's logic,
// but can be a reference or used in client-side if absolutely necessary (though not recommended for initial creation).
export const createUserProfileDocument = async (
  uid: string, 
  email: string | null,
  phoneNumber: string | null,
  displayName: string | null,
  photoURL: string | null,
  authProvider: string
  ) => {
  const userDocRef = doc(db, "users", uid);
  const now = serverTimestamp();
  const newUserProfile: UserProfile = {
    userId: uid,
    email,
    phoneNumber,
    displayName,
    photoURL,
    authProvider,
    createdAt: now as Timestamp, // Will be converted to Timestamp by server
    updatedAt: now as Timestamp,
    lastLoginAt: now as Timestamp,
    isActive: true,
    roles: ['user'],
    customClaims: {},
    preferences: {
      preferredAirport: null,
      notificationSettings: { email: true, push: true, sms: false },
      valuesBasedFilters: [],
    },
    // affiliateInfo, linkedVendorId, deviceTokens can be omitted or set to null/empty
  };
  await setDoc(userDocRef, newUserProfile);
};
