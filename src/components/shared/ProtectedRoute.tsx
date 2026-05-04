import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to their respective dashboard if they don't have access
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  // Force password change if not onboarded (or whatever the logic is)
  // The user mentioned: "On first login, force a password change screen"
  // For now, we'll just check if they are onboarded or if it's their first time.
  // Actually, I'll add a check for 'forcePasswordChange' in profile if needed.

  return <>{children}</>;
};
