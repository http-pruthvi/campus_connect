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

import { auth, signInWithEmailAndPassword } from "../firebase";

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // The AuthContext will pick up the change and fetch the user profile from Firestore
    // We can just wait for the context to update, but to ensure smooth navigation:
    // We'll navigate to /home first, and the ProtectedRoutes will handle redirection if needed.
    navigate("/home");

  } catch (err: any) {
    console.error(err);
    let message = "Login failed. Please check your credentials.";
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
      message = "Invalid email or password.";
    } else if (err.code === "auth/too-many-requests") {
      message = "Too many failed attempts. Please try again later.";
    }
    setError(message);
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

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="textSecondary">
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4F46E5", fontWeight: "bold", textDecoration: "none" }}>
            Register here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}