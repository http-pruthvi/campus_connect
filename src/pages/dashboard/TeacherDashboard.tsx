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
  CircularProgress,
} from "@mui/material";
import {
  Users,
  FileCheck,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  Clock,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalStudents: 124,
    pendingReviews: 12,
    activeClasses: 4,
    newQueries: 5,
  });

  const performanceData = [
    { name: "Mon", score: 65 },
    { name: "Tue", score: 72 },
    { name: "Wed", score: 85 },
    { name: "Thu", score: 78 },
    { name: "Fri", score: 90 },
  ];

  interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  trend: string;
}

const StatCard = ({ title, value, icon: Icon, color, trend }: StatCardProps) => (
  <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color: color }}>
        <Icon size={24} />
      </Box>
      <Chip 
        label={trend} 
        size="small" 
        sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, height: 24 }} 
      />
    </Box>
    <Typography variant="h4" fontWeight={800} gutterBottom>{value}</Typography>
    <Typography variant="body2" color="textSecondary" fontWeight={600}>{title}</Typography>
  </Paper>
);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
            Faculty Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your classes, students, and curriculum
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Calendar size={18} />} sx={{ borderRadius: '12px' }}>
          Schedule Class
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color={theme.palette.primary.main} trend="+5%" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={FileCheck} color={theme.palette.error.main} trend="High" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Today's Classes" value={stats.activeClasses} icon={Calendar} color={theme.palette.success.main} trend="Full" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="New Queries" value={stats.newQueries} icon={MessageSquare} color={theme.palette.secondary.main} trend="+2" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Average Class Performance</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                 <Chip label="Internal" size="small" variant="filled" color="primary" sx={{ fontWeight: 700 }} />
                 <Chip label="Mid-Sem" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
              </Box>
            </Box>
            <Box sx={{ height: 320, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke={theme.palette.primary.main} strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>Recent Submissions</Typography>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i !== 3 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main }}>S</Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Student Name {i}</Typography>
                    <Typography variant="caption" color="textSecondary">Data Structures • Assignment 2</Typography>
                  </Box>
                </Box>
                <Button size="small" variant="outlined">Review</Button>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Today's Lectures</Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { time: '10:00 AM', subject: 'Cloud Computing', class: 'BE-Computer A' },
                { time: '01:15 PM', subject: 'Mathematics III', class: 'SE-Computer B' },
                { time: '03:00 PM', subject: 'Digital Logic', class: 'FE-Electrical' },
              ].map((lec, i) => (
                <Box key={i} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.05)}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Clock size={14} color={theme.palette.primary.main} />
                    <Typography variant="caption" fontWeight={700} color="primary.main">{lec.time}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>{lec.subject}</Typography>
                  <Typography variant="caption" color="textSecondary">{lec.class}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 4, bgcolor: theme.palette.secondary.main, color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Quick Actions</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Common management tasks</Typography>
              </Box>
              <ArrowUpRight size={24} />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button fullWidth sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', justifyContent: 'flex-start', py: 1.5 }}>Mark Attendance</Button>
              <Button fullWidth sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', justifyContent: 'flex-start', py: 1.5 }}>Upload Notice</Button>
              <Button fullWidth sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', justifyContent: 'flex-start', py: 1.5 }}>Mentorship Q&A</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
