import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { getTheme } from "./theme";
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

// Pages
import NoticeBoard from "./pages/NoticeBoard";
import LostFoundPage from "./pages/LostAndFound";
import QueriesPage from "./pages/QueriesPage";
import Events from "./pages/Events";
import Attendance from "./pages/Attendance";
import Assignments from "./pages/Assignments";
import Grades from "./pages/Grades";
import Timetable from "./pages/Timetable";
import Chat from "./pages/Chat";

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

function AnimatedRoutes({ mode, toggleColorMode }: { mode: 'light' | 'dark', toggleColorMode: () => void }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= AUTHENTICATED (WITH LAYOUT) ================= */}
        <Route element={<MainLayout mode={mode} toggleColorMode={toggleColorMode} />}>
          <Route path="/home" element={<Home />} />
          
          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "HOD", "TEACHER", "STUDENT"]} />}>
            <Route path="/events" element={<Events />} />
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/lostfound" element={<LostFoundPage />} />
            <Route path="/queries" element={<QueriesPage />} />
            
            {/* New Features */}
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/chat" element={<Chat />} />
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
    </AnimatePresence>
  );
}

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
            <AnimatedRoutes mode={mode} toggleColorMode={toggleColorMode} />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}