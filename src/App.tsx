import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { getTheme } from "./theme";
import { useState, useMemo, useEffect } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";

// Academic
import Attendance from "./pages/academic/Attendance";
import Timetable from "./pages/academic/Timetable";
import Assignments from "./pages/academic/Assignments";
import Grades from "./pages/academic/Grades";
import NoticeBoard from "./pages/academic/NoticeBoard";

// Campus
import LostAndFound from "./pages/campus/LostAndFound";
import Events from "./pages/campus/Events";
import FinancePanel from "./pages/campus/FinancePanel";

// Support
import Chat from "./pages/support/Chat";
import QueriesPage from "./pages/support/QueriesPage";
import Mentorship from "./pages/support/Mentorship";

// Admin
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminUserManagement from "./pages/dashboard/AdminUserManagement";

// HOD
import HodDashboard from "./pages/dashboard/HodDashboard";
import HODUserManagement from "./pages/dashboard/HODUserManagement";

// Teacher
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TeacherUserManagement from "./pages/dashboard/TeacherUserManagement";

// Student
import StudentDashboard from "./pages/dashboard/StudentDashboard";

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* ================= PUBLIC ================= */}
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ================= AUTHENTICATED (WITH LAYOUT) ================= */}
              <Route element={<MainLayout mode={mode} toggleColorMode={toggleColorMode} />}>
                <Route element={<ProtectedRoute allowedRoles={["ADMIN", "HOD", "TEACHER", "STUDENT"]} />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/notices" element={<NoticeBoard />} />
                  <Route path="/lostfound" element={<LostAndFound />} />
                  <Route path="/queries" element={<QueriesPage />} />
                  
                  {/* New Features */}
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/timetable" element={<Timetable />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/grades" element={<Grades />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/mentorship" element={<Mentorship />} />
                </Route>

                {/* ================= ADMIN ================= */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                  <Route path="/admin" element={<div><AdminDashboard /><AdminUserManagement /></div>} />
                </Route>

                {/* ================= HOD ================= */}
                <Route element={<ProtectedRoute allowedRoles={["HOD"]} />}>
                  <Route path="/hod" element={<div><HodDashboard /><HODUserManagement /></div>} />
                </Route>

                {/* ================= TEACHER ================= */}
                <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
                  <Route path="/teacher" element={<div><TeacherDashboard /><TeacherUserManagement /></div>} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={["TEACHER", "HOD", "ADMIN"]} />}>
                  <Route path="/fees" element={<FinancePanel />} />
                </Route>

                {/* ================= STUDENT ================= */}
                <Route element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]} />}>
                  <Route path="/student" element={<StudentDashboard />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
