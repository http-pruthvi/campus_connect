import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/shared/AppShell";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// ─── Lazy imports ─────────────────────────────────────────────────────────────
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ChangePassword = lazy(() => import("@/pages/auth/ChangePassword"));
const Logout = lazy(() => import("@/pages/auth/Logout"));
const NoticeBoard = lazy(() => import("@/pages/shared/NoticeBoard"));
const EventsPage = lazy(() => import("@/pages/shared/Events"));
const QnAPage = lazy(() => import("@/pages/shared/QnA"));
const UserManagementPage = lazy(() => import("@/pages/admin/UserManagement"));
const QueriesPage = lazy(() => import("@/pages/student/Queries"));
const LostFoundPage = lazy(() => import("@/pages/student/LostFound"));
const FeesPage = lazy(() => import("@/pages/student/Fees"));
const DepartmentPage = lazy(() => import("@/pages/hod/Department"));
const ProfilePage = lazy(() => import("@/pages/shared/Profile"));
const AttendancePage = lazy(() => import("@/pages/teacher/Attendance"));
const AssignmentsPage = lazy(() => import("@/pages/teacher/Assignments"));
const MarksPage = lazy(() => import("@/pages/teacher/Marks"));
const NotFoundPage = lazy(() => import("@/pages/shared/NotFound"));

import {
  AdminDashboard,
  HODDashboard,
  TeacherDashboard,
  StudentDashboard,
} from "@/pages/dashboard/Dashboard";

// ─── Page Loader ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

// ─── Smart Dashboard — dispatches to the right dashboard by role ──────────────
const SmartDashboard: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn't find your user profile. Please contact administration.
          </p>
        </div>
      </div>
    );
  }

  switch (profile.role) {
    case "admin":   return <AdminDashboard />;
    case "hod":     return <HODDashboard />;
    case "teacher": return <TeacherDashboard />;
    case "student": return <StudentDashboard />;
    default:
      return (
        <div className="flex h-64 w-full items-center justify-center">
          <p className="text-muted-foreground">Unknown role: {profile.role}</p>
        </div>
      );
  }
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* ── Redirect root ──────────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Protected: Dashboard ───────────────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <SmartDashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Shared features ─────────────────────────────────── */}
        <Route
          path="/shared/notices"
          element={
            <ProtectedRoute>
              <AppShell>
                <NoticeBoard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared/events"
          element={
            <ProtectedRoute>
              <AppShell>
                <EventsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared/qna"
          element={
            <ProtectedRoute>
              <AppShell>
                <QnAPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Profile ───────────────────────────────────────────── */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Admin ───────────────────────────────────────────── */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin", "hod"]}>
              <AppShell>
                <UserManagementPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: HOD ─────────────────────────────────────────────── */}
        <Route
          path="/hod/department"
          element={
            <ProtectedRoute allowedRoles={["hod"]}>
              <AppShell>
                <DepartmentPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Teacher ─────────────────────────────────────────── */}
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute allowedRoles={["teacher", "hod"]}>
              <AppShell>
                <AttendancePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRoles={["teacher", "hod"]}>
              <AppShell>
                <AssignmentsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/marks"
          element={
            <ProtectedRoute allowedRoles={["teacher", "hod"]}>
              <AppShell>
                <MarksPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Student ─────────────────────────────────────────── */}
        <Route
          path="/student/queries"
          element={
            <ProtectedRoute>
              <AppShell>
                <QueriesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute>
              <AppShell>
                <FeesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lost-found"
          element={
            <ProtectedRoute>
              <AppShell>
                <LostFoundPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── Catch All (404) ────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
