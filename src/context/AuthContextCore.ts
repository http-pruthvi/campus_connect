import { createContext, useContext } from "react";

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "HOD" | "TEACHER" | "STUDENT";
  name?: string;
  department?: string;
  year?: string;
  financeAccess?: boolean;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
