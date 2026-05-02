// src/pages/Login.jsx
import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/globals.css";
import "../styles/Login.css";

import API from "../api/axios";

export default function Login() {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

const handleLogin = async () => {
  setError("");
  setLoading(true);

  try {
    const res = await API.post("/auth/login", { email, password });
    const data = res.data;

    // ✅ Normalize role properly
    const role = data.role?.trim().toUpperCase();

    // ✅ Store token & role separately (VERY IMPORTANT)
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", role);

    const userData = {
      id: data.id,
      email: data.email,
      role,
      name: data.name,
      department: data.department,
      year: data.year,
      financeAccess: data.financeAccess,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // ✅ Role-based navigation (FIXES your navbar issue too)
    if (role === "ADMIN") {
      navigate("/admin");
    } else if (role === "TEACHER") {
      navigate("/teacher");
    } else if (role === "HOD") {
      navigate("/hod");
    } else {
      navigate("/student");
    }

  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || err.response?.data || "Server error. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <Container sx={{ mt: 12, textAlign: "center" }} className="login-container">
      <Typography variant="h5" sx={{ mb: 3 }}>
        Campus Connect Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : "Login"}
      </Button>
    </Container>
  );
}