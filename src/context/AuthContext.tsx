
"use client";
import type { User } from "firebase/auth";
import { createContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase/config";
import type { UserProfile } from "@/lib/types";
import { getUserProfile } from "@/lib/firebase/firestore";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  reloadUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  reloadUserProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user: User | null) => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null); // Clear profile on error
      }
    } else {
      setUserProfile(null);
    }
  };
  
  const reloadUserProfile = async () => {
    if (currentUser) {
      setLoading(true);
      await fetchUserProfile(currentUser);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      await fetchUserProfile(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, reloadUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
