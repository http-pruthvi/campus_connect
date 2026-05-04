import { useAuth } from "./useAuth";

export const useRole = () => {
  const { profile, loading, isAdmin, isHOD, isTeacher, isStudent } = useAuth();

  return {
    role: profile?.role,
    isAdmin,
    isHOD,
    isTeacher,
    isStudent,
    loading
  };
};
