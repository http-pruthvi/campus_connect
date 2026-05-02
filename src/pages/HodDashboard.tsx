import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid2 as Grid,
  Paper,
  Box,
  Avatar,
  Divider,
  Chip,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HodDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  
  const stats = [
    { title: "Department Faculty", value: 12, icon: ShieldCheck, color: theme.palette.primary.main },
    { title: "Total Students", value: 245, icon: Users, color: theme.palette.success.main },
    { title: "Average Attendance", value: "84%", icon: TrendingUp, color: theme.palette.secondary.main },
    { title: "Pending Approvals", value: 8, icon: AlertCircle, color: theme.palette.error.main },
  ];

  const deptPerformance = [
    { name: "Sem 1", avg: 72 },
    { name: "Sem 3", avg: 78 },
    { name: "Sem 5", avg: 85 },
    { name: "Sem 7", avg: 81 },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
          HOD Dashboard: {user?.department}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Departmental oversight and faculty coordination
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(s.color, 0.1), color: s.color, width: 'fit-content', mb: 2 }}>
                <s.icon size={24} />
              </Box>
              <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
              <Typography variant="caption" color="textSecondary" fontWeight={700}>{s.title}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>Departmental Academic Performance</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={deptPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="avg" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Faculty Overview</Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>T</Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>Professor {i}</Typography>
                      <Typography variant="caption" color="textSecondary">Senior Lecturer</Typography>
                    </Box>
                  </Box>
                  <Chip label="Active" size="small" color="success" variant="outlined" sx={{ fontSize: '0.6rem', fontWeight: 800 }} />
                </Box>
              ))}
            </Box>
            <Button fullWidth sx={{ mt: 3 }}>Manage Faculty</Button>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 4, bgcolor: theme.palette.warning.main, color: 'white' }}>
            <FileText size={32} style={{ marginBottom: '16px' }} />
            <Typography variant="h6" fontWeight={800}>Administrative Tasks</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1, mb: 3 }}>You have 8 pending student approval requests for this department.</Typography>
            <Button fullWidth variant="contained" sx={{ bgcolor: 'white', color: 'warning.main', '&:hover': { bgcolor: alpha('#fff', 0.9) } }}>Review Requests</Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
