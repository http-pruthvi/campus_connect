import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { useAuth } from "./context/AuthContext";
import {
  Container, Typography, Box, TextField, Select, MenuItem,
  Button, Grid, Paper, Avatar, Dialog, DialogTitle, DialogContent, 
  DialogActions, InputAdornment, Chip, Divider, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Switch
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import "./styles/TeacherDashboard.css";

function TabPanel({ children, value, index }: any) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function FinancePanel() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [masterTab, setMasterTab] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [studentTransactions, setStudentTransactions] = useState<any[]>([]);
  
  const [feeForm, setFeeForm] = useState({ 
    totalFees: "", paidFees: "", 
    tuitionFee: "", libraryFee: "", hostelFee: "", examFee: "", semester: "Semester 1",
    paymentMethod: "Cash", referenceNumber: ""
  });

  if (user && user.role?.toUpperCase() !== "ADMIN" && !user.financeAccess) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, textAlign: 'center' }}>
        <Paper sx={{ p: 5, borderRadius: '20px', borderTop: '5px solid #F43F5E' }}>
          <Typography variant="h5" color="error" fontWeight="bold">Access Denied</Typography>
          <Typography variant="body1" sx={{ mt: 2, color: '#475569' }}>You do not have permission to access the Finance Management Panel. Please contact an Administrator to grant you access.</Typography>
        </Paper>
      </Container>
    );
  }

  const fetchData = async () => {
    try {
      const [uSnap, fSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "fees"))
      ]);
      const allUsers = uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const allFees = fSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      let deptStudents = allUsers.filter((u: any) => u.role?.toUpperCase() === "STUDENT");
      if (user?.role?.toUpperCase() !== "ADMIN") {
        deptStudents = deptStudents.filter((u: any) => u.department?.toLowerCase() === user?.department?.toLowerCase());
      }
      setStudents(deptStudents);
      setAllPlatformUsers(allUsers.filter((u: any) => u.role?.toUpperCase() !== "STUDENT"));
      setFees(allFees);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const [allPlatformUsers, setAllPlatformUsers] = useState<any[]>([]);

  const toggleUserAccess = async (targetUser: any) => {
    try {
      const { id, ...userData } = targetUser;
      const updatedAccess = !userData.financeAccess;
      await updateDoc(doc(db, "users", id), { financeAccess: updatedAccess });
      fetchData(); // Refresh the list
    } catch (e) {
      alert("Error updating user access");
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleOpenStudentDetails = async (student: any) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
    setStudentTransactions([]);
    try {
      const q = query(collection(db, "transactions"), where("user.id", "==", student.id));
      const querySnapshot = await getDocs(q);
      const txList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudentTransactions(txList);
    } catch (e) {
      console.error("Failed to fetch transactions");
    }
  };

  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text?.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <span key={i} style={{ backgroundColor: "#ffff00" }}>{part}</span>
        : part
    );
  };

  const getStudentFeeRecord = (studentId: string) => {
    return fees.find(f => (f.user && f.user.id === studentId) || (f.userId === studentId));
  };

  const handleAssignFee = async () => {
    const tuition = Number(feeForm.tuitionFee) || 0;
    const library = Number(feeForm.libraryFee) || 0;
    const hostel = Number(feeForm.hostelFee) || 0;
    const exam = Number(feeForm.examFee) || 0;
    const total = tuition + library + hostel + exam;

    if (total === 0 || !selectedStudent) return alert("Total fee cannot be zero");
    try {
      await addDoc(collection(db, "fees"), {
        totalFees: total,
        paidFees: Number(feeForm.paidFees) || 0,
        remainingFees: total - (Number(feeForm.paidFees) || 0),
        status: (total - (Number(feeForm.paidFees) || 0)) <= 0 ? "Paid" : "Pending",
        tuitionFee: tuition,
        libraryFee: library,
        hostelFee: hostel,
        examFee: exam,
        semester: feeForm.semester,
        user: { id: selectedStudent.id, department: selectedStudent.department }
      });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (e) { alert("Error assigning fee"); }
  };

  const handleLogPayment = async () => {
    if (!feeForm.paidFees || !selectedStudent) return alert("Amount required");
    try {
      const rec = getStudentFeeRecord(selectedStudent.id);
      const paymentAmount = Number(feeForm.paidFees);
      const paid = Number(rec.paidFees) + paymentAmount;
      
      await updateDoc(doc(db, "fees", rec.id), {
        totalFees: rec.totalFees,
        paidFees: paid,
        remainingFees: rec.totalFees - paid,
        status: (rec.totalFees - paid) <= 0 ? "Paid" : "Pending",
        paymentMethod: feeForm.paymentMethod,
        referenceNumber: feeForm.referenceNumber,
        user: { id: selectedStudent.id }
      });

      // Optionally log a transaction here if needed in a pure Firebase setup
      await addDoc(collection(db, "transactions"), {
        date: new Date().toISOString(),
        type: "PAYMENT",
        amount: paymentAmount,
        paymentMethod: feeForm.paymentMethod,
        referenceNumber: feeForm.referenceNumber,
        user: { id: selectedStudent.id, name: selectedStudent.name }
      });

      setIsPayModalOpen(false);
      fetchData();
    } catch (e) { alert("Error logging payment"); }
  };

  const totalExpected = fees.reduce((acc, f) => acc + (f.totalFees || 0), 0);
  const totalCollected = fees.reduce((acc, f) => acc + (f.paidFees || 0), 0);
  const totalPending = totalExpected - totalCollected;

  const tabs = ["All", "Unassigned", "Pending", "Paid"];
  const filteredList = [
    students,
    students.filter(s => !getStudentFeeRecord(s.id)),
    students.filter(s => { const r = getStudentFeeRecord(s.id); return r && r.status !== 'Paid'; }),
    students.filter(s => { const r = getStudentFeeRecord(s.id); return r && r.status === 'Paid'; })
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", textAlign: 'center', color: '#4F46E5' }}>
        Fees Management
      </Typography>

      {user?.role?.toUpperCase() === "ADMIN" && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Tabs value={masterTab} onChange={(e, n) => setMasterTab(n)} centered sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}>
            <Tab label="Fees Dashboard" sx={{ fontWeight: 'bold' }} />
            <Tab label="Access Management" sx={{ fontWeight: 'bold' }} />
          </Tabs>
        </Box>
      )}

      {/* FEES DASHBOARD (Tab 0) */}
      <TabPanel value={masterTab} index={0}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Expected", val: totalExpected, col: "#4F46E5" },
          { label: "Collected", val: totalCollected, col: "#10B981" },
          { label: "Outstanding", val: totalPending, col: "#F43F5E" }
        ].map((stat, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Paper sx={{ p: 3, borderRadius: '15px', borderLeft: `6px solid ${stat.col}` }}>
              <Typography variant="body2" color="textSecondary">{stat.label}</Typography>
              <Typography variant="h5" fontWeight="bold">₹{stat.val.toLocaleString()}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
              <Tabs value={tabIndex} onChange={(e, n) => setTabIndex(n)} sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}>
                {tabs.map((t, i) => <Tab key={i} label={t} />)}
              </Tabs>
              <TextField 
                size="small" 
                placeholder="Search students..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                sx={{ minWidth: '250px', bgcolor: '#f8fafc', borderRadius: 1 }}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Box>

            <TabPanel value={tabIndex} index={tabIndex}>
              <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc', '& th': { borderBottom: '2px solid #e2e8f0' } }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Year</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Semester</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Total Fees</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Paid</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Due</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredList[tabIndex]
                      .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
                      .map(s => {
                        const r = getStudentFeeRecord(s.id);
                        return (
                          <TableRow key={s.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: '0.2s', '&:hover': { bgcolor: '#f8fafc', transform: 'scale(1.002)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' } }}>
                            <TableCell>
                              <Box 
                                display="flex" 
                                alignItems="center" 
                                gap={2} 
                                sx={{ cursor: 'pointer', '&:hover .student-name': { color: '#4F46E5', textDecoration: 'underline' } }}
                                onClick={() => handleOpenStudentDetails(s)}
                              >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0e7ff', color: '#4f46e5' }}><PersonIcon fontSize="small" /></Avatar>
                                <Typography className="student-name" fontWeight="bold" sx={{ color: '#1e293b', transition: '0.2s' }}>{highlight(s.name, search)}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{s.year || '-'}</TableCell>
                            <TableCell>{s.department}</TableCell>
                            <TableCell>
                              {r && r.semester ? <Chip label={r.semester} size="small" color="primary" variant="outlined" /> : <Typography variant="body2" color="textSecondary">-</Typography>}
                            </TableCell>
                            <TableCell>
                              {r ? <Typography fontWeight="500">₹{r.totalFees}</Typography> : '-'}
                            </TableCell>
                            <TableCell>
                              {r ? <Typography fontWeight="500" sx={{ color: '#10B981' }}>₹{r.paidFees}</Typography> : '-'}
                            </TableCell>
                            <TableCell>
                              {r ? <Typography fontWeight="500" sx={{ color: '#F43F5E' }}>₹{r.remainingFees}</Typography> : '-'}
                            </TableCell>
                            <TableCell>
                              {r ? <Chip label={r.status} size="small" sx={{ bgcolor: r.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: r.status === 'Paid' ? '#10B981' : '#F59E0B', fontWeight: 'bold' }} /> : <Chip label="Unassigned" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b' }} />}
                            </TableCell>
                            <TableCell align="center">
                              {!r ? (
                                <Button variant="contained" size="small" sx={{ whiteSpace: 'nowrap', minWidth: '70px' }} onClick={()=>{
                                  setSelectedStudent(s);
                                  setFeeForm({ tuitionFee: "", libraryFee: "", hostelFee: "", examFee: "", semester: "Semester 1", paidFees: 0, paymentMethod: "Cash", referenceNumber: "" });
                                  setIsAssignModalOpen(true);
                                }}>Assign</Button>
                              ) : r.status !== 'Paid' ? (
                                <Button variant="outlined" size="small" sx={{ whiteSpace: 'nowrap', minWidth: '70px' }} onClick={()=>{
                                  setSelectedStudent(s);
                                  setFeeForm(prev => ({ ...prev, paidFees: 0, paymentMethod: "Cash", referenceNumber: "" }));
                                  setIsPayModalOpen(true);
                                }}>Pay</Button>
                              ) : (
                                <Button disabled size="small" sx={{ whiteSpace: 'nowrap', minWidth: '70px' }}>Paid</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {filteredList[tabIndex].filter(s => s.name?.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                            <Typography color="textSecondary">No students found.</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      </TabPanel>

      {/* ACCESS MANAGEMENT (Tab 1 - Admins Only) */}
      {user?.role?.toUpperCase() === "ADMIN" && (
        <TabPanel value={masterTab} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1e293b' }}>
              Platform Access Control
            </Typography>
            <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc', '& th': { borderBottom: '2px solid #e2e8f0' } }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }} align="center">Access Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allPlatformUsers.map(u => (
                    <TableRow key={u.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: '0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={u.role} size="small" color={u.role === 'ADMIN' ? 'error' : u.role === 'HOD' ? 'secondary' : 'primary'} />
                      </TableCell>
                      <TableCell>{u.department || '-'}</TableCell>
                      <TableCell align="center">
                        <Switch 
                          checked={!!u.financeAccess} 
                          onChange={() => toggleUserAccess(u)} 
                          color="success"
                          disabled={u.id === user.id} // Prevent admin from locking themselves out
                        />
                        <Typography variant="caption" display="block" color={u.financeAccess ? "success.main" : "error.main"} fontWeight="bold">
                          {u.financeAccess ? "Granted" : "Revoked"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>
      )}

      <Dialog open={isAssignModalOpen} onClose={()=>setIsAssignModalOpen(false)}>
        <DialogTitle>Assign University Fee</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            sx={{ mt: 2 }}
            value={feeForm.semester || "Semester 1"}
            onChange={e=>setFeeForm({...feeForm, semester: e.target.value})}
          >
            <MenuItem value="Semester 1">Semester 1</MenuItem>
            <MenuItem value="Semester 2">Semester 2</MenuItem>
            <MenuItem value="Semester 3">Semester 3</MenuItem>
            <MenuItem value="Semester 4">Semester 4</MenuItem>
            <MenuItem value="Semester 5">Semester 5</MenuItem>
            <MenuItem value="Semester 6">Semester 6</MenuItem>
            <MenuItem value="Semester 7">Semester 7</MenuItem>
            <MenuItem value="Semester 8">Semester 8</MenuItem>
          </Select>
          <TextField label="Tuition Fee" fullWidth type="number" sx={{ mt: 2 }} value={feeForm.tuitionFee} onChange={e=>setFeeForm({...feeForm,tuitionFee:e.target.value})} />
          <TextField label="Library Fee" fullWidth type="number" sx={{ mt: 2 }} value={feeForm.libraryFee} onChange={e=>setFeeForm({...feeForm,libraryFee:e.target.value})} />
          <TextField label="Hostel Fee" fullWidth type="number" sx={{ mt: 2 }} value={feeForm.hostelFee} onChange={e=>setFeeForm({...feeForm,hostelFee:e.target.value})} />
          <TextField label="Exam Fee" fullWidth type="number" sx={{ mt: 2 }} value={feeForm.examFee} onChange={e=>setFeeForm({...feeForm,examFee:e.target.value})} />
          
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Total Calculated: ₹{(Number(feeForm.tuitionFee)||0) + (Number(feeForm.libraryFee)||0) + (Number(feeForm.hostelFee)||0) + (Number(feeForm.examFee)||0)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setIsAssignModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignFee}>Assign</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isPayModalOpen} onClose={()=>setIsPayModalOpen(false)}>
        <DialogTitle>Log Payment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>Due: ₹{selectedStudent && getStudentFeeRecord(selectedStudent.id)?.remainingFees}</Typography>
          <TextField label="Amount" fullWidth type="number" sx={{ mt: 2 }} value={feeForm.paidFees} onChange={e=>setFeeForm({...feeForm,paidFees:e.target.value})} />
          
          <Select
            fullWidth
            sx={{ mt: 2 }}
            value={feeForm.paymentMethod || "Cash"}
            onChange={e=>setFeeForm({...feeForm, paymentMethod: e.target.value})}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="Card">Credit/Debit Card</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
          </Select>
          
          {feeForm.paymentMethod !== "Cash" && (
            <TextField 
              label="Reference / Transaction Number" 
              fullWidth 
              sx={{ mt: 2 }} 
              value={feeForm.referenceNumber || ""} 
              onChange={e=>setFeeForm({...feeForm, referenceNumber: e.target.value})} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setIsPayModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLogPayment}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          Student Details - {selectedStudent?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3, bgcolor: '#f1f5f9' }}>
          {selectedStudent && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, borderRadius: '15px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>Profile</Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}><strong style={{ color: '#1e293b' }}>Email:</strong> {selectedStudent.email}</Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}><strong style={{ color: '#1e293b' }}>Department:</strong> {selectedStudent.department}</Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}><strong style={{ color: '#1e293b' }}>Year:</strong> {selectedStudent.year || '-'}</Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, color: '#475569' }}><strong style={{ color: '#1e293b' }}>Role:</strong> {selectedStudent.role}</Typography>
                  
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>Fee Summary</Typography>
                  {(() => {
                    const r = getStudentFeeRecord(selectedStudent.id);
                    if (!r) return <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>No university fees assigned yet.</Typography>;
                    return (
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1.5}><Typography variant="body2" sx={{ color: '#475569' }}>Total Fees:</Typography><Typography fontWeight="bold" sx={{ color: '#1e293b' }}>₹{r.totalFees}</Typography></Box>
                        <Box display="flex" justifyContent="space-between" mb={1.5}><Typography variant="body2" sx={{ color: '#475569' }}>Paid Amount:</Typography><Typography fontWeight="bold" sx={{ color: '#10B981' }}>₹{r.paidFees}</Typography></Box>
                        <Box display="flex" justifyContent="space-between" mb={1.5}><Typography variant="body2" sx={{ color: '#475569' }}>Outstanding Due:</Typography><Typography fontWeight="bold" sx={{ color: '#F43F5E' }}>₹{r.remainingFees}</Typography></Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}><Typography variant="body2" sx={{ color: '#475569' }}>Current Status:</Typography><Chip label={r.status} size="small" sx={{ fontWeight: 'bold', bgcolor: r.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: r.status === 'Paid' ? '#10B981' : '#F59E0B' }} /></Box>
                      </Box>
                    );
                  })()}
                </Paper>
              </Grid>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3, borderRadius: '15px', height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>Transaction History</Typography>
                  {studentTransactions.length > 0 ? (
                    <TableContainer sx={{ borderRadius: '10px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                      <Table size="small" sx={{ minWidth: 400 }}>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Method</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>Transaction ID</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentTransactions.map(t => (
                            <TableRow key={t.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell sx={{ color: '#475569' }}>{new Date(t.date).toLocaleDateString()}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: '#10B981' }}>+ ₹{t.amount}</TableCell>
                              <TableCell sx={{ color: '#475569' }}>{t.paymentMethod || 'Cash'}</TableCell>
                              <TableCell sx={{ color: '#475569' }}>{t.referenceNumber ? t.referenceNumber : `TXN-${t.id}`}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box textAlign="center" py={4} bgcolor="#f8fafc" borderRadius="10px">
                      <Typography variant="body2" color="textSecondary">No transactions found for this student.</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setIsDetailsModalOpen(false)} variant="outlined" sx={{ borderRadius: '20px', textTransform: 'none' }}>Close Details</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
