import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Chip,
  Box,
  Button,
} from "@mui/material";
import CountUp from "react-countup";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  // ✅ FIX 1: SAFE NORMALIZATION (NO CRASH)
  const normalizedUsers = users.map((u) => ({
    ...u,
    role: u.role ? u.role.toString().trim().toLowerCase() : "",
    department: u.department ? u.department.toString().trim().toLowerCase() : "not assigned",
  }));

  // 🔍 FILTER LOGIC
  const filteredUsers = normalizedUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter ? u.role === roleFilter : true;
    const matchesDept = deptFilter ? u.department === deptFilter : true;

    return matchesSearch && matchesRole && matchesDept;
  });

  // 📊 FIX 2: STATS SHOULD USE ALL USERS (NOT FILTERED)
  const stats = {
    totalUsers: normalizedUsers.length,
    totalHOD: normalizedUsers.filter((u) => u.role === "hod").length,
    totalTeachers: normalizedUsers.filter((u) => u.role === "teacher").length,
    totalStudents: normalizedUsers.filter((u) => u.role === "student").length,
    totalPending: normalizedUsers.filter((u) => !u.approved).length,
  };

  const statCards = [
    { label: "Total Users", count: stats.totalUsers, color: "#4f46e5" },
    { label: "Total HODs", count: stats.totalHOD, color: "#16a34a" },
    { label: "Total Teachers", count: stats.totalTeachers, color: "#f59e0b" },
    { label: "Total Students", count: stats.totalStudents, color: "#e11d48" },
    { label: "Pending Approval", count: stats.totalPending, color: "#0ea5e9" },
    { label: "Fees Management", count: stats.totalStudents, color: "#8b5cf6", path: "/fees" },
  ];

  // 📌 FIX 3: REMOVE INVALID DEPARTMENT VALUES
  const departments = [
    ...new Set(
      users
        .map((u) => u.department)
        .filter((dept) => dept && dept !== "")
    ),
  ];

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setDeptFilter("");
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Admin Dashboard
      </Typography>

      <TextField
        fullWidth
        label="Search users by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="hod">HOD</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Filter by Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {departments.map((dept, i) => (
              <MenuItem key={i} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2 }}>
        {search && <Chip label={`Search: ${search}`} sx={{ mr: 1 }} />}
        {roleFilter && <Chip label={`Role: ${roleFilter}`} sx={{ mr: 1 }} />}
        {deptFilter && <Chip label={`Dept: ${deptFilter}`} sx={{ mr: 1 }} />}

        {(search || roleFilter || deptFilter) && (
          <Button size="small" color="error" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
            <Paper
              className="stats-card"
              style={{
                borderTop: `5px solid ${card.color}`,
                textAlign: "center",
                padding: "20px",
                borderRadius: "12px",
                cursor: card.path ? "pointer" : "default"
              }}
              elevation={6}
              onClick={() => card.path && navigate(card.path)}
            >
              <Typography variant="subtitle1">{card.label}</Typography>
              <Typography variant="h4" style={{ color: card.color }}>
                <CountUp end={card.count} duration={1.5} />
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {(search || roleFilter || deptFilter) && (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6">{user.name || "No Name"}</Typography>
                  <Typography>{user.email}</Typography>
                  <Typography>Role: {user.role}</Typography>
                  <Typography>Dept: {user.department}</Typography>
                  <Typography
                    sx={{
                      color: user.approved ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {user.approved ? "Approved" : "Pending"}
                  </Typography>
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography sx={{ mt: 3, width: "100%", textAlign: "center" }}>
              No users found
            </Typography>
          )}
        </Grid>
      )}
    </Container>
  );
}