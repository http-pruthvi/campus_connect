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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Users,
  ShieldCheck,
  Building2,
  Activity,
  UserPlus,
  Settings,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  getDocs,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 450,
    teachers: 42,
    students: 380,
    departments: 6,
  });

  const userData = [
    { name: "Jan", users: 320 },
    { name: "Feb", users: 340 },
    { name: "Mar", users: 380 },
    { name: "Apr", users: 410 },
    { name: "May", users: 450 },
  ];

  const deptData = [
    { name: "Computer", value: 150 },
    { name: "Mechanical", value: 80 },
    { name: "Electrical", value: 70 },
    { name: "Civil", value: 80 },
  ];

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.warning.main, theme.palette.error.main];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: `1px solid ${alpha(color, 0.1)}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color: color }}>
          <Icon size={24} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800}>{value}</Typography>
          <Typography variant="caption" color="textSecondary" fontWeight={700}>{title}</Typography>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
            Administration Central
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Comprehensive system overview and user management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Settings size={18} />}>System Logs</Button>
          <Button variant="contained" startIcon={<UserPlus size={18} />}>Add Faculty</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Network" value={stats.totalUsers} icon={Users} color={theme.palette.primary.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Faculty" value={stats.teachers} icon={ShieldCheck} color={theme.palette.success.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Students" value={stats.students} icon={TrendingUp} color={theme.palette.secondary.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Active Depts" value={stats.departments} icon={Building2} color={theme.palette.warning.main} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>User Growth Analytics</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke={theme.palette.primary.main} strokeWidth={4} dot={{ r: 6, fill: theme.palette.primary.main, strokeWidth: 3, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Recent User Activity</Typography>
              <Button size="small">Manage Users</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Activity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'John Doe', role: 'STUDENT', status: 'Active', time: '2 mins ago' },
                    { name: 'Dr. Smith', role: 'TEACHER', status: 'Active', time: '15 mins ago' },
                    { name: 'Jane Wilson', role: 'HOD', status: 'Inactive', time: '1 hour ago' },
                  ].map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>{row.name.charAt(0)}</Avatar>
                          <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={row.role} size="small" sx={{ fontSize: '0.6rem', fontWeight: 800 }} /></TableCell>
                      <TableCell><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.status === 'Active' ? 'success.main' : 'error.main', display: 'inline-block', mr: 1 }} /> {row.status}</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{row.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Department Distribution</Typography>
            <Box sx={{ height: 280, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={deptData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2 }}>
              {deptData.map((d, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="caption" fontWeight={600}>{d.name}</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}>{d.value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 4, bgcolor: theme.palette.primary.main, color: 'white' }}>
            <Activity size={32} style={{ marginBottom: '16px' }} />
            <Typography variant="h6" fontWeight={800}>Infrastructure Status</Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={600}>Database Usage</Typography>
                  <Typography variant="caption" fontWeight={600}>42%</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <Box sx={{ width: '42%', height: '100%', borderRadius: 3, bgcolor: 'success.main' }} />
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={600}>Storage Usage</Typography>
                  <Typography variant="caption" fontWeight={600}>18%</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <Box sx={{ width: '18%', height: '100%', borderRadius: 3, bgcolor: 'white' }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
