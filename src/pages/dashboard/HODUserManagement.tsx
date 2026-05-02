import React, { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import {
  Container, Typography, Grid2 as Grid, Paper, Box, TextField, Select, MenuItem,
  Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Switch, Avatar, InputAdornment, Chip, Divider
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import "../../../styles/HODDashboard.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  year?: string;
  approved: boolean;
}

interface Fee {
  id: string;
  totalFees: number;
  paidFees: number;
  remainingFees: number;
  status: string;
  user: {
    id: string;
    department: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function HodUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "STUDENT", year: "" });
  const [tabIndex, setTabIndex] = useState(0);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Fee state
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState({ totalFees: "", paidFees: "" });

  const fetchData = async () => {
    try {
      if (!user?.department) return;
      const usersQuery = query(collection(db, "users"), where("department", "==", user.department));
      const [uSnap, fSnap] = await Promise.all([
        getDocs(usersQuery),
        getDocs(collection(db, "fees"))
      ]);
      
      const usersList = uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      const feesList = fSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Fee[];
      
      setUsers(usersList);
      setFees(feesList);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text?.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? <span key={i} style={{ backgroundColor: "#ffff00" }}>{part}</span> : part
    );
  };

  const handleAddUser = async () => {
    if (!form.name || !form.email || !user?.department) return alert("Fields missing");
    const password = Math.random().toString(36).slice(-8);
    try {
      await addDoc(collection(db, "users"), { ...form, department: user.department, password, approved: false });
      emailjs.send("service_ydtu7jp", "template_etypntv", { name: form.name, email: form.email, password }, "NN3gMWSv34ggrAvsV");
      setForm({ name: "", email: "", role: "STUDENT", year: "" });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try { 
      const { id, ...userData } = editUser;
      await updateDoc(doc(db, "users", id), userData as any); 
      setEditUser(null); 
      fetchData(); 
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (id: string) => {
    try { await updateDoc(doc(db, "users", id), { approved: true }); fetchData(); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete user?")) {
      try { await deleteDoc(doc(db, "users", id)); fetchData(); } catch (e) { console.error(e); }
    }
  };

  const handleAssignFee = async () => {
    if (!selectedStudent) return;
    try {
      const total = Number(feeForm.totalFees);
      const paid = Number(feeForm.paidFees) || 0;
      await addDoc(collection(db, "fees"), { 
        totalFees: total, 
        paidFees: paid, 
        remainingFees: total - paid,
        status: (total - paid) <= 0 ? 'Paid' : 'Pending',
        user: { id: selectedStudent.id, department: selectedStudent.department } 
      });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (e) { alert("Error"); }
  };

  const handleLogPayment = async () => {
    if (!selectedStudent) return;
    try {
      const rec = fees.find(f => f.user?.id === selectedStudent.id);
      if (!rec) return;
      const paid = Number(rec.paidFees) + Number(feeForm.paidFees);
      await updateDoc(doc(db, "fees", rec.id), { 
        ...rec, 
        paidFees: paid, 
        remainingFees: rec.totalFees - paid, 
        status: (rec.totalFees - paid) <= 0 ? 'Paid' : 'Pending' 
      });
      setIsPayModalOpen(false);
      fetchData();
    } catch (e) { alert("Error"); }
  };

  const getFee = (id: string) => fees.find(f => f.user?.id === id);

  const tabs = ["Students", "Teachers", "Pending Approvals", "Fees Management"];
  const filteredData = [
    users.filter(u => u.role === "STUDENT" && u.approved),
    users.filter(u => u.role === "TEACHER" && u.approved),
    users.filter(u => !u.approved),
    users.filter(u => u.role === "STUDENT" && u.approved)
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: 'bold', color: '#4F46E5' }}>
        HOD Management - {user?.department}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: tabIndex === 3 ? 12 : 4 }}>
          {tabIndex !== 3 ? (
            <Paper sx={{ p: 3, borderRadius: '15px' }} elevation={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Add User</Typography>
              <TextField label="Name" fullWidth sx={{ mb: 2 }} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              <TextField label="Email" fullWidth sx={{ mb: 2 }} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
              <Select fullWidth sx={{ mb: 2 }} value={form.role} onChange={e=>setForm({...form,role:e.target.value as string})}>
                <MenuItem value="STUDENT">Student</MenuItem><MenuItem value="TEACHER">Teacher</MenuItem>
              </Select>
              {form.role === "STUDENT" && (
                <Select fullWidth sx={{ mb: 2 }} value={form.year} onChange={e=>setForm({...form,year:e.target.value as string})} displayEmpty>
                  <MenuItem value="" disabled>Select Year</MenuItem><MenuItem value="1">1st Year</MenuItem><MenuItem value="2">2nd Year</MenuItem>
                </Select>
              )}
              <Button variant="contained" fullWidth onClick={handleAddUser}>Add User</Button>
            </Paper>
          ) : (
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <Paper sx={{ p: 2, flex: 1, borderLeft: '5px solid #4F46E5' }}>
                  <Typography variant="caption">Total Expected</Typography>
                  <Typography variant="h6">₹{fees.filter(f=>f.user?.department===user?.department).reduce((a,b)=>a+b.totalFees,0).toLocaleString()}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, borderLeft: '5px solid #10B981' }}>
                  <Typography variant="caption">Collected</Typography>
                  <Typography variant="h6">₹{fees.filter(f=>f.user?.department===user?.department).reduce((a,b)=>a+b.paidFees,0).toLocaleString()}</Typography>
                </Paper>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: tabIndex === 3 ? 12 : 8 }}>
          <Paper sx={{ p: 2, borderRadius: '15px' }} elevation={8}>
            <Tabs value={tabIndex} onChange={(e: React.SyntheticEvent, v: number)=>setTabIndex(v)} variant="fullWidth" sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}>
              {tabs.map((t,i)=><Tab key={i} label={t} sx={{fontWeight:'bold'}}/>)}
            </Tabs>
            <TextField fullWidth size="small" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} sx={{ my: 2 }} />

            <TabPanel value={tabIndex} index={tabIndex}>
              <Grid container spacing={2}>
                {filteredData[tabIndex].filter(u => u.name?.toLowerCase().includes(search.toLowerCase())).map(u => {
                  const fr = getFee(u.id);
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={u.id}>
                      <Paper sx={{ p: 2, borderRadius: '12px', borderTop: `4px solid ${tabIndex===3 ? (fr?(fr.status==='Paid'?'#10B981':'#F59E0B'):'#94A3B8') : (u.approved?'#16a34a':'#2563EB')}` }}>
                        <Typography fontWeight="bold">{highlight(u.name, search)}</Typography>
                        <Typography variant="caption" color="textSecondary">{u.email}</Typography>
                        {tabIndex === 3 && (
                          <Box mt={1}>
                            {fr ? (
                              <>
                                <Typography variant="body2">Due: ₹{fr.remainingFees}</Typography>
                                <Chip label={fr.status} size="small" color={fr.status==='Paid'?'success':'warning'} />
                              </>
                            ) : <Typography variant="body2">Unassigned</Typography>}
                          </Box>
                        )}
                        <Box mt={2} display="flex" gap={1}>
                          {tabIndex === 3 ? (
                            !fr ? <Button size="small" variant="contained" onClick={()=>{setSelectedStudent(u);setIsAssignModalOpen(true);}}>Assign</Button>
                                : fr.status!=='Paid' ? <Button size="small" variant="outlined" onClick={()=>{setSelectedStudent(u);setIsPayModalOpen(true);}}>Pay</Button>
                                : <Chip label="Paid" variant="outlined" color="success" />
                          ) : (
                            <>
                              {!u.approved && <Button variant="contained" size="small" color="success" onClick={()=>handleApprove(u.id)}>Approve</Button>}
                              <Button variant="outlined" size="small" onClick={()=>setEditUser(u)}>Edit</Button>
                              <Button variant="contained" size="small" color="error" onClick={()=>handleDelete(u.id)}>Delete</Button>
                            </>
                          )}
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

      {/* MODALS SAME AS ADMIN */}
      <Dialog open={!!editUser} onClose={()=>setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (["name","email"] as const).map(f => <TextField key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} fullWidth sx={{mt:2}} value={editUser[f]||""} onChange={e=>setEditUser({...editUser,[f]:e.target.value})}/>)}
        </DialogContent>
        <DialogActions><Button onClick={()=>setEditUser(null)}>Cancel</Button><Button variant="contained" onClick={handleUpdate}>Save</Button></DialogActions>
      </Dialog>

      <Dialog open={isAssignModalOpen} onClose={()=>setIsAssignModalOpen(false)}>
        <DialogTitle>Assign Fee</DialogTitle>
        <DialogContent>
          <TextField label="Total" fullWidth sx={{mt:2}} type="number" value={feeForm.totalFees} onChange={e=>setFeeForm({...feeForm,totalFees:e.target.value})}/>
        </DialogContent>
        <DialogActions><Button onClick={()=>setIsAssignModalOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleAssignFee}>Assign</Button></DialogActions>
      </Dialog>

      <Dialog open={isPayModalOpen} onClose={()=>setIsPayModalOpen(false)}>
        <DialogTitle>Pay Fee</DialogTitle>
        <DialogContent>
          <TextField label="Amount" fullWidth sx={{mt:2}} type="number" value={feeForm.paidFees} onChange={e=>setFeeForm({...feeForm,paidFees:e.target.value})}/>
        </DialogContent>
        <DialogActions><Button onClick={()=>setIsPayModalOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleLogPayment}>Pay</Button></DialogActions>
      </Dialog>
    </Container>
  );
}