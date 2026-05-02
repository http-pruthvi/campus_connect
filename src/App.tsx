import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import theme from "./theme";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />

          {/* ================= COMMON (ALL LOGGED USERS) ================= */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "HOD", "TEACHER", "STUDENT"]} />}>
            <Route path="/events" element={<Events />} />
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/lostfound" element={<LostFoundPage />} />
            <Route path="/queries" element={<QueriesPage />} />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin"
              element={
                <div>
                  <AdminDashboard />
                  <AdminUserManagement />
                </div>
              }
            />
          </Route>

          {/* ================= HOD ================= */}
          <Route element={<ProtectedRoute allowedRoles={["HOD"]} />}>
            <Route
              path="/hod"
              element={
                <div>
                  <HodDashboard />
                  <HODUserManagement />
                </div>
              }
            />
          </Route>

          {/* ================= TEACHER ================= */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route
              path="/teacher"
              element={
                <div>
                  <TeacherDashboard />
                  <TeacherUserManagement />
                </div>
              }
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["TEACHER", "HOD", "ADMIN"]} />}>
            <Route path="/fees" element={<FinancePanel />} />
          </Route>

          {/* ================= STUDENT ================= */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]} />}>
            <Route path="/student" element={<StudentDashboard />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}