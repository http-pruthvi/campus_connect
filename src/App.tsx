import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import theme from "./theme";

import PrivateRoute from "./routes/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";

// Pages
import NoticeBoard from "./pages/NoticeBoard";
import LostFoundPage from "./pages/LostAndFound";
import QueriesPage from "./pages/QueriesPage";
import Events from "./pages/Events";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";

// HOD
import HodDashboard from "./pages/HodDashboard";
import HODUserManagement from "./pages/HODUserManagement";

// Teacher
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherUserManagement from "./pages/TeacherUserManagement";
import FinancePanel from "./FinancePanel";

// Student
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>

          <Navbar />

        <Routes>

          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />

          {/* ================= COMMON (ALL LOGGED USERS) ================= */}
          <Route
            path="/events"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <Events />
              </PrivateRoute>
            }
          />

          <Route
            path="/notices"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <NoticeBoard />
              </PrivateRoute>
            }
          />

          <Route
            path="/lostfound"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <LostFoundPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/queries"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <QueriesPage />
              </PrivateRoute>
            }
          />

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <div>
                  <AdminDashboard />
                  <AdminUserManagement />
                </div>
              </PrivateRoute>
            }
          />

          {/* ================= HOD ================= */}
          <Route
            path="/hod"
            element={
              <PrivateRoute allowedRoles={["hod"]}>
                <div>
                  <HodDashboard />
                  <HODUserManagement />
                </div>
              </PrivateRoute>
            }
          />

          {/* ================= TEACHER ================= */}
          <Route
            path="/teacher"
            element={
              <PrivateRoute allowedRoles={["teacher"]}>
                <div>
                  <TeacherDashboard />
                  <TeacherUserManagement />
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/fees"
            element={
              <PrivateRoute allowedRoles={["teacher", "hod", "admin"]}>
                <FinancePanel />
              </PrivateRoute>
            }
          />

          {/* ================= STUDENT ================= */}
          <Route
            path="/student"
            element={
              <PrivateRoute allowedRoles={["student", "admin"]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}