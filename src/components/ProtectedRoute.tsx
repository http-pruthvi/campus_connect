import { Navigate, Outlet } from "react-router-dom";
import { useAuth, User } from "../context/AuthContext";
import { CircularProgress, Box } from "@mui/material";

interface ProtectedRouteProps {
  allowedRoles?: User["role"][];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(user.role.toUpperCase())) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
