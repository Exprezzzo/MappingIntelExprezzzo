
"use client";
import type { User } from "firebase/auth";
import { createContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "@/lib/firebase/config"; // auth can be null
import type { UserProfile } from "@/lib/types";
import { getUserProfile } from "@/lib/firebase/firestore";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  firebaseAuthInitialized: boolean; // New state to indicate if Firebase auth is ready
  reloadUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  firebaseAuthInitialized: false, // Default to false
  reloadUserProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseAuthInitialized, setFirebaseAuthInitialized] = useState(false);

  const fetchUserProfile = async (user: User | null) => {
    if (user && db) { // Check if db is initialized
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null); 
      }
    } else {
      setUserProfile(null);
      if (!db) console.warn("Firestore (db) is not initialized. Cannot fetch user profile.");
    }
  };
  
  const reloadUserProfile = async () => {
    if (currentUser && auth && db) { // Check auth and db
      setLoading(true);
      await fetchUserProfile(currentUser);
      setLoading(false);
    } else {
        if (!auth) console.warn("Firebase Auth not initialized. Cannot reload profile.");
        if (!db) console.warn("Firestore (db) not initialized. Cannot reload profile.");
    }
  };

  useEffect(() => {
    if (auth) { // Only subscribe if auth is initialized
      setFirebaseAuthInitialized(true);
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        setCurrentUser(user);
        await fetchUserProfile(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Firebase auth is not initialized (likely due to missing API key or config)
      console.warn("Firebase Auth is not initialized in AuthContext. Authentication will not work.");
      setFirebaseAuthInitialized(false);
      setLoading(false); // Stop loading, as there's nothing to wait for from auth
      setCurrentUser(null);
      setUserProfile(null);
    }
  }, []); // Run once on mount

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, firebaseAuthInitialized, reloadUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
