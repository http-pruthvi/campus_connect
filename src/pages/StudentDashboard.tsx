import { useEffect, useState } from "react";
import API from "../api/axios";
import { Container, Typography, Grid, Paper, Box, Avatar, Divider, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DownloadIcon from "@mui/icons-material/Download";
import { generateReceiptPDF } from "../utils/pdfGenerator";
import "../styles/Home.css"; // Reuse some styles

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feeRecord, setFeeRecord] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const userId = user?.id || JSON.parse(localStorage.getItem("user") || "{}")?.id;
    if (userId && userId !== "undefined") {
      // Fetch Fee Summary
      API.get(`/fees/user/${userId}`)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setFeeRecord(res.data[0]);
          } else if (res.data && !Array.isArray(res.data)) {
            setFeeRecord(res.data);
          }
        })
        .catch(err => console.error("Failed to fetch fees:", err));

      // Fetch Transaction History
      API.get(`/transactions/user/${userId}`)
        .then(res => {
          setTransactions(res.data);
        })
        .catch(err => console.error("Failed to fetch transactions:", err));
    }
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} className="fade-in">
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center", fontWeight: "bold", background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Student Portal
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel" sx={{ p: 4, textAlign: "center", height: "100%" }}>
            <Avatar sx={{ mx: "auto", mb: 2, background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', width: 80, height: 80, boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1E293B' }}>
              {user?.name || "Student Name"}
            </Typography>
            <Typography sx={{ color: '#475569', mb: 2 }}>{user?.email}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box textAlign="left" sx={{ color: '#334155' }}>
              <Typography sx={{ mb: 1 }}><strong>Department:</strong> {user?.department || "N/A"}</Typography>
              <Typography sx={{ mb: 1 }}><strong>Year:</strong> {user?.year || "N/A"}</Typography>
              <Typography><strong>Role:</strong> {user?.role}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: Quick Links & Finance */}
        <Grid item xs={12} md={8}>
          
          {/* Financial Overview */}
          <Paper className="glass-panel" sx={{ p: 3, mb: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <AccountBalanceWalletIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">Financial Overview</Typography>
            </Box>
            
            {feeRecord ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                    <Typography variant="body2" color="textSecondary">Total Fees</Typography>
                    <Typography variant="h5" fontWeight="bold">₹{feeRecord.totalFees}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <Typography variant="body2" color="textSecondary">Paid Amount</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#10B981' }}>₹{feeRecord.paidFees}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                    <Typography variant="body2" color="textSecondary">Outstanding</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#F43F5E' }}>₹{feeRecord.remainingFees}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary" component="div">
                    Status: <Chip label={feeRecord.status} color={feeRecord.status === 'Paid' ? 'success' : 'warning'} size="small" />
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Contact your department HOD to log payments.
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography color="textSecondary">No fee records found for your account.</Typography>
              </Box>
            )}
          </Paper>

          {/* Payment History Section */}
          <Paper className="glass-panel" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Payment History</Typography>
            {transactions.length > 0 ? (
              <TableContainer sx={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Method</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Transaction ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }} align="center">Receipt</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ color: '#475569' }}>{new Date(t.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={t.type} 
                            size="small" 
                            color={t.type === 'PAYMENT' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: t.amount > 0 ? '#10B981' : 'inherit' }}>
                          {t.amount > 0 ? `+ ₹${t.amount}` : '-'}
                        </TableCell>
                        <TableCell sx={{ color: '#475569' }}>{t.paymentMethod || 'Cash'}</TableCell>
                        <TableCell sx={{ color: '#475569' }}>{t.referenceNumber ? t.referenceNumber : `TXN-${t.id}`}</TableCell>
                        <TableCell align="center">
                          {t.amount > 0 && (
                            <Tooltip title="Download PDF Receipt">
                              <IconButton color="primary" onClick={() => generateReceiptPDF(t, user, feeRecord)}>
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary" align="center" py={2}>No transactions recorded yet.</Typography>
            )}
          </Paper>

          {/* Quick Links */}
          <Grid container spacing={3}>
            {/* Notices */}
            <Grid item xs={12} sm={6}>
              <Paper 
                className="glass-panel"
                sx={{ p: 3, textAlign: "center", cursor: "pointer", transition: "0.3s", "&:hover": { transform: "translateY(-5px)", boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}
                onClick={() => navigate("/notices")}
              >
                <AssignmentIcon sx={{ fontSize: 50, mb: 1, color: '#4F46E5' }} />
                <Typography variant="h6" fontWeight="bold">Campus Notices</Typography>
                <Typography variant="body2" color="textSecondary">View latest announcements</Typography>
              </Paper>
            </Grid>

            {/* Events */}
            <Grid item xs={12} sm={6}>
              <Paper 
                className="glass-panel"
                sx={{ p: 3, textAlign: "center", cursor: "pointer", transition: "0.3s", "&:hover": { transform: "translateY(-5px)", boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}
                onClick={() => navigate("/events")}
              >
                <EventIcon sx={{ fontSize: 50, mb: 1, color: '#0EA5E9' }} />
                <Typography variant="h6" fontWeight="bold">Upcoming Events</Typography>
                <Typography variant="body2" color="textSecondary">Register and RSVP</Typography>
              </Paper>
            </Grid>

            {/* Lost and Found */}
            <Grid item xs={12} sm={6}>
              <Paper 
                className="glass-panel"
                sx={{ p: 3, textAlign: "center", cursor: "pointer", transition: "0.3s", "&:hover": { transform: "translateY(-5px)", boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}
                onClick={() => navigate("/lostfound")}
              >
                <SearchIcon sx={{ fontSize: 50, mb: 1, color: '#F59E0B' }} />
                <Typography variant="h6" fontWeight="bold">Lost & Found</Typography>
                <Typography variant="body2" color="textSecondary">Report or claim items</Typography>
              </Paper>
            </Grid>

            {/* Queries / Mentorship */}
            <Grid item xs={12} sm={6}>
              <Paper 
                className="glass-panel"
                sx={{ p: 3, textAlign: "center", cursor: "pointer", transition: "0.3s", "&:hover": { transform: "translateY(-5px)", boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}
                onClick={() => navigate("/queries")}
              >
                <PersonIcon sx={{ fontSize: 50, mb: 1, color: '#10B981' }} />
                <Typography variant="h6" fontWeight="bold">Mentorship</Typography>
                <Typography variant="body2" color="textSecondary">Ask questions to teachers</Typography>
              </Paper>
            </Grid>
          </Grid>

        </Grid>
      </Grid>
    </Container>
  );
}
