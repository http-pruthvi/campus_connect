/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isHOD: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isHOD: false,
  isTeacher: false,
  isStudent: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile from Firestore and listen to updates
        unsubscribeProfile = onSnapshot(
          doc(db, "users", user.uid),
          (userDoc) => {
            if (userDoc.exists()) {
              setProfile(userDoc.data() as UserProfile);
            } else {
              console.warn("User document does not exist for uid:", user.uid);
              setProfile(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching user profile:", error);
            // Don't set profile to null immediately on transient offline errors
            // if we already have it, but do stop loading
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        setLoading(false);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    isHOD: profile?.role === "hod",
    isTeacher: profile?.role === "teacher",
    isStudent: profile?.role === "student",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
