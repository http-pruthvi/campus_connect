import emailjs from "emailjs-com";
import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  Container, Typography, TextField, Button, Grid, Paper, Box, Tabs, Tab,
  Switch, FormControlLabel, Dialog, DialogActions, DialogContent, 
  DialogTitle, Avatar, Select, MenuItem, InputAdornment, Chip, Divider
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import "../styles/AdminDashboard.css";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "Student", department: "", year: "" });
  const [tabIndex, setTabIndex] = useState(0);
  const [editUser, setEditUser] = useState(null);

  const fetchData = async () => {
    try {
      const uRes = await API.get("/users");
      setUsers(uRes.data);
    } catch (e) { console.error("Fetch error:", e); }
  };

  useEffect(() => { fetchData(); }, []);

  const highlight = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text?.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? <span key={i} style={{ backgroundColor: "#ffff00" }}>{part}</span> : part
    );
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.role || !form.department) return alert("Fields missing");
    const password = Math.random().toString(36).slice(-8);
    try {
      await API.post("/users", { ...form, role: form.role.toUpperCase(), password, approved: false });
      emailjs.send("service_ydtu7jp", "template_etypntv", { name: form.name, email: form.email, password }, "NN3gMWSv34ggrAvsV");
      setForm({ name: "", email: "", role: "Student", department: "", year: "" });
      fetchData();
    } catch (e) { alert("Error adding user"); }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/users/${editUser.id}`, editUser);
      setEditUser(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (id) => {
    try { await API.put(`/users/${id}/approve`); fetchData(); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete user?")) {
      try { await API.delete(`/users/${id}`); fetchData(); } catch (e) { console.error(e); }
    }
  };

  const tabs = ["HODs", "Teachers", "Students", "Approvals"];
  const filteredData = [
    users.filter(u => u.role === "HOD"),
    users.filter(u => u.role === "TEACHER"),
    users.filter(u => u.role === "STUDENT"),
    users.filter(u => !u.approved)
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: 'bold', color: '#4F46E5' }}>
        Admin Control Center
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Add User</Typography>
            <TextField label="Name" fullWidth sx={{ mb: 2 }} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <TextField label="Email" fullWidth sx={{ mb: 2 }} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <Select fullWidth sx={{ mb: 2 }} value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <MenuItem value="HOD">HOD</MenuItem><MenuItem value="Teacher">Teacher</MenuItem><MenuItem value="Student">Student</MenuItem>
            </Select>
            <TextField label="Department" fullWidth sx={{ mb: 2 }} value={form.department} onChange={e=>setForm({...form,department:e.target.value})} />
            <Button variant="contained" fullWidth onClick={handleAdd}>Add User</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={tabIndex} onChange={(e,v)=>setTabIndex(v)} variant="scrollable" sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}>
              {tabs.map((t,i)=><Tab key={i} label={t} sx={{fontWeight:'bold'}}/>)}
            </Tabs>
            <TextField fullWidth size="small" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} sx={{ my: 2 }} />

            <TabPanel value={tabIndex} index={tabIndex}>
              <Grid container spacing={2}>
                {filteredData[tabIndex].filter(u => u.name?.toLowerCase().includes(search.toLowerCase())).map(u => {
                  return (
                    <Grid item xs={12} sm={6} md={4} key={u.id}>
                      <Paper sx={{ p: 2, borderTop: `4px solid ${u.approved?'#16a34a':'#2563EB'}` }}>
                        <Typography fontWeight="bold">{highlight(u.name, search)}</Typography>
                        <Typography variant="caption" color="textSecondary">{u.email}</Typography>
                        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                          {!u.approved && <Button variant="contained" size="small" color="success" onClick={()=>handleApprove(u.id)}>Approve</Button>}
                          <Button variant="outlined" size="small" onClick={()=>setEditUser(u)}>Edit</Button>
                          <Button variant="contained" size="small" color="error" onClick={()=>handleDelete(u.id)}>Delete</Button>
                        </Box>
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* MODALS */}
      <Dialog open={!!editUser} onClose={()=>setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && ["name","email","department"].map(f => <TextField key={f} label={f} fullWidth sx={{mt:2}} value={editUser[f]||""} onChange={e=>setEditUser({...editUser,[f]:e.target.value})}/>)}
        </DialogContent>
        <DialogActions><Button onClick={()=>setEditUser(null)}>Cancel</Button><Button variant="contained" onClick={handleUpdate}>Save</Button></DialogActions>
      </Dialog>
    </Container>
  );
}