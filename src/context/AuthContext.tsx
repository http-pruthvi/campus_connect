import { useState, useEffect, ReactNode } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { AuthContext, User, useAuth } from "./AuthContextCore";
export { useAuth };
export type { User };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (unsubscribeDoc) unsubscribeDoc();

        const userRef = doc(db, "users", firebaseUser.uid);
        
        // Timeout to stop loading if profile never appears
        const profileTimeout = setTimeout(() => {
          setLoading(false);
          console.warn("Profile fetch timed out for:", firebaseUser.email);
        }, 8000);

        unsubscribeDoc = onSnapshot(userRef, (userDoc) => {
          if (userDoc.exists()) {
            clearTimeout(profileTimeout);
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              role: userData.role,
              name: userData.name,
              department: userData.department,
              year: userData.year,
              financeAccess: userData.financeAccess,
            } as User);
            setLoading(false);
          } else {
            console.warn("Waiting for user profile doc...");
          }
        }, (error) => {
          clearTimeout(profileTimeout);
          console.error("Profile listener error:", error);
          setLoading(false);
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
