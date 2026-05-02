import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

const steps = ["Account Details", "Profile Information"];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const navigate = useNavigate();

  const handleNext = () => {
    if (activeStep === 0) {
      if (!email || !password || !confirmPassword) {
        setError("Please fill all fields");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }
    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleRegister = async () => {
    if (!name || !role || (role !== "ADMIN" && !department)) {
      setError("Please fill all profile details");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        department: role === "ADMIN" ? "Administration" : department,
        year: role === "STUDENT" ? year : "N/A",
        approved: false, // New users must be approved by Admin/HOD
        financeAccess: false,
        createdAt: new Date().toISOString(),
      });

      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom sx={{ color: "#4F46E5" }}>
          Join Campus Connect
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {activeStep === 0 ? (
          <Box component="form">
            <TextField
              fullWidth
              label="Email Address"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleNext}
              sx={{ mt: 3, py: 1.5 }}
            >
              Next Step
            </Button>
          </Box>
        ) : (
          <Box component="form">
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              select
              fullWidth
              label="I am a..."
              margin="normal"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="TEACHER">Teacher</MenuItem>
              <MenuItem value="HOD">HOD</MenuItem>
              <MenuItem value="ADMIN">Administrator</MenuItem>
            </TextField>

            {role !== "ADMIN" && (
              <TextField
                select
                fullWidth
                label="Department"
                margin="normal"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <MenuItem value="Computer Engineering">Computer Engineering</MenuItem>
                <MenuItem value="Electrical Engineering">Electrical Engineering</MenuItem>
                <MenuItem value="Mechanical Engineering">Mechanical Engineering</MenuItem>
                <MenuItem value="Civil Engineering">Civil Engineering</MenuItem>
              </TextField>
            )}

            {role === "STUDENT" && (
              <TextField
                select
                fullWidth
                label="Current Year"
                margin="normal"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              >
                <MenuItem value="1st">1st Year</MenuItem>
                <MenuItem value="2nd">2nd Year</MenuItem>
                <MenuItem value="3rd">3rd Year</MenuItem>
                <MenuItem value="4th">4th Year</MenuItem>
              </TextField>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button fullWidth variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Complete Registration"}
              </Button>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            Already have an account?{" "}
            <Link to="/" style={{ color: "#4F46E5", fontWeight: "bold", textDecoration: "none" }}>
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
