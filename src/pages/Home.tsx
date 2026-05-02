import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./dashboard/AdminDashboard";
import HodDashboard from "./dashboard/HodDashboard";
import TeacherDashboard from "./dashboard/TeacherDashboard";
import StudentDashboard from "./dashboard/StudentDashboard";
import { CircularProgress, Box } from "@mui/material";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const role = user?.role?.toUpperCase();

  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "HOD":
      return <HodDashboard />;
    case "TEACHER":
      return <TeacherDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
}
