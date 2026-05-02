import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import emailjs from "emailjs-com";
import {
  Container, Typography, Grid, Paper, Box, TextField,
  Select, MenuItem, Button, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, Avatar, InputAdornment
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from "@mui/icons-material/Search";
import "../styles/TeacherDashboard.css";

function TabPanel({ children, value, index }: any) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ mt: 2 }}>{children}</Box>}</div>;
}

export default function TeacherUserManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", year: "" });
  const [tabIndex, setTabIndex] = useState(0);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [yearFilter, setYearFilter] = useState("");

  const years = ["1", "2", "3", "4"];

  const fetchStudents = async () => {
    if (!user?.department) return;
    try {
      const q = query(
        collection(db, "users"), 
        where("department", "==", user.department),
        where("role", "==", "STUDENT")
      );
      const querySnapshot = await getDocs(q);
      const deptStudents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(deptStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  // 🔍 Highlight function
  const highlight = (text: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text?.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? <span key={i} style={{ backgroundColor: "yellow" }}>{part}</span>
        : part
    );
  };

  // 🔍 Apply filters
  const applyFilters = (list: any[]) => {
    return list.filter(s => {
      const matchSearch =
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase());

      const matchYear = yearFilter ? s.year === yearFilter : true;

      return matchSearch && matchYear;
    });
  };

  // Add Student
  const handleAddStudent = async () => {
    if (!form.name || !form.email || !form.year)
      return alert("All fields required");

    const password = Math.random().toString(36).slice(-8);

    try {
      await addDoc(collection(db, "users"), {
        ...form,
        role: "STUDENT",
        department: user.department,
        approved: false,
        password: password
      });

      emailjs.send("service_ydtu7jp", "template_etypntv",
        { name: form.name, email: form.email, password },
        "NN3gMWSv34ggrAvsV"
      );

      setForm({ name: "", email: "", year: "" });
      fetchStudents();
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editStudent) return;
    try {
      const { id, ...studentData } = editStudent;
      await updateDoc(doc(db, "users", id), studentData);
      setEditStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete student?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        fetchStudents();
      } catch (error) {
        console.error("Failed to delete student:", error);
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "users", id), { approved: true });
      fetchStudents();
    } catch (error) {
      console.error("Failed to approve student:", error);
    }
  };

  const handleTabChange = (e, newValue) => {
    setTabIndex(newValue);
    setYearFilter("");
  };

  // Tabs data
  const approvedStudents = applyFilters(students.filter(s => s.approved));
  const pendingStudents = applyFilters(students.filter(s => !s.approved));

  const filteredStudents = [approvedStudents, pendingStudents];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Teacher Student Management - {user?.department}
      </Typography>

      {/* 🔍 SEARCH + FILTER */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Years</MenuItem>
          {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </Select>
      </Box>

      {/* FORM */}
      <Paper elevation={4} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Add Student</Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
            <MenuItem value="" disabled>Select Year</MenuItem>
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
          <Button variant="contained" onClick={handleAddStudent}>Add</Button>
        </Box>
      </Paper>

      {/* TABS */}
      <Paper sx={{ p: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth" sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}>
          <Tab label={`Approved (${approvedStudents.length})`} />
          <Tab label={`Pending (${pendingStudents.length})`} />
        </Tabs>

        {filteredStudents.map((list, idx) => (
          <TabPanel key={idx} value={tabIndex} index={idx}>
            {list.length === 0 ? (
              <Typography>No students found</Typography>
            ) : (
              <Grid container spacing={2}>
                {list.map(s => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s.id}>
                    <Paper sx={{ p: 2, textAlign: "center", "&:hover": { transform: "scale(1.05)" } }}>
                      <Avatar sx={{ mx: "auto", mb: 1 }}>
                        <PersonIcon />
                      </Avatar>

                      <Typography fontWeight="bold">{highlight(s.name)}</Typography>
                      <Typography>{highlight(s.email)}</Typography>
                      <Typography>Year: {s.year}</Typography>

                      <Typography color={s.approved ? "green" : "red"}>
                        {s.approved ? "Approved" : "Pending"}
                      </Typography>

                      <Box mt={1}>
                        {!s.approved && (
                          <Button variant="contained" size="small" color="success" onClick={() => handleApprove(s.id)}>Approve</Button>
                        )}
                        <Button variant="contained" size="small" sx={{ mx: 1 }} onClick={() => setEditStudent(s)}>Edit</Button>
                        <Button variant="contained" size="small" color="error" onClick={() => handleDelete(s.id)}>Delete</Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        ))}
      </Paper>

      {/* EDIT */}
      <Dialog open={!!editStudent} onClose={() => setEditStudent(null)}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          {editStudent && ["name", "email", "year"].map(field => (
            <TextField
              key={field}
              label={field}
              value={editStudent[field] || ""}
              onChange={e => setEditStudent({ ...editStudent, [field]: e.target.value })}
              fullWidth
              sx={{ mb: 2, mt: field === "name" ? 1 : 0 }}
            />
          ))}
          <FormControlLabel
            control={
              <Switch
                checked={editStudent?.approved || false}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, approved: e.target.checked })
                }
              />
            }
            label="Approved"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditStudent(null)}>Cancel</Button>
          <Button onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}