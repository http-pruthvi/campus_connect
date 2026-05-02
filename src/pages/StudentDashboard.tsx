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
  LinearProgress,
} from "@mui/material";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function StudentDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState({
    attendance: 82,
    pendingAssignments: 3,
    unreadMessages: 2,
    upcomingEvents: 1,
  });
  const [notices, setNotices] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Real-time notices
    const noticeQuery = query(collection(db, "notices"), limit(3));
    const unsubscribeNotices = onSnapshot(noticeQuery, (snap) => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Assignments
    const assignmentQuery = query(
      collection(db, "assignments"),
      where("department", "==", user.department),
      where("year", "==", user.year),
      limit(3)
    );
    const unsubscribeAssignments = onSnapshot(assignmentQuery, (snap) => {
      setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubscribeNotices();
      unsubscribeAssignments();
    };
  }, [user]);

  const attendanceData = [
    { name: "Math", value: 85 },
    { name: "DS", value: 72 },
    { name: "DLD", value: 90 },
    { name: "OS", value: 78 },
    { name: "Cloud", value: 88 },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Paper sx={{ p: 3, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="textSecondary" fontWeight={600}>{title}</Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>{value}</Typography>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color: color }}>
          <Icon size={24} />
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', bgcolor: alpha(color, 0.2) }}>
        <Box sx={{ width: typeof value === 'string' ? '100%' : `${value}%`, height: '100%', bgcolor: color }} />
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening on campus today.
        </Typography>
      </Box>

      {/* STATS GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Attendance" value={`${stats.attendance}%`} icon={CheckCircle2} color={theme.palette.success.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Assignments" value={stats.pendingAssignments} icon={FileText} color={theme.palette.primary.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Messages" value={stats.unreadMessages} icon={MessageSquare} color={theme.palette.secondary.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Events" value={stats.upcomingEvents} icon={Calendar} color={theme.palette.warning.main} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* LEFT COLUMN */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Attendance Analytics</Typography>
              <Button size="small" endIcon={<ArrowRight size={16} />}>Detailed Report</Button>
            </Box>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 600, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontWeight: 600, fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value < 75 ? theme.palette.error.main : theme.palette.primary.main} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            {stats.attendance < 75 && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05), display: 'flex', alignItems: 'center', gap: 2 }}>
                <AlertCircle color={theme.palette.error.main} size={20} />
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  Your attendance is below the 75% threshold. Please attend more classes to avoid eligibility issues.
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Upcoming Assignments</Typography>
              <Button component={Link} to="/assignments" size="small">View All</Button>
            </Box>
            <Grid container spacing={2}>
              {assignments.map((asgn) => (
                <Grid size={{ xs: 12 }} key={asgn.id}>
                  <Box sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                        <FileText size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{asgn.title}</Typography>
                        <Typography variant="caption" color="textSecondary">{asgn.subject} • Due {asgn.dueDate}</Typography>
                      </Box>
                    </Box>
                    <Button variant="outlined" size="small" component={Link} to="/assignments">Submit</Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3, bgcolor: theme.palette.primary.main, color: 'white' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Today's Schedule</Typography>
            <Box sx={{ mt: 3 }}>
              {[
                { time: '09:00 AM', subject: 'Mathematics III', room: 'L-102' },
                { time: '11:15 AM', subject: 'Data Structures', room: 'Lab-4' },
                { time: '02:00 PM', subject: 'Operating Systems', room: 'L-201' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Typography variant="caption" sx={{ minWidth: 65, fontWeight: 700, opacity: 0.8 }}>{item.time}</Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{item.subject}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Room {item.room}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Button fullWidth variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: alpha('#fff', 0.9) }, mt: 1 }}>
              View Full Timetable
            </Button>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Recent Notices</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {notices.map((notice) => (
                <Box key={notice.id}>
                  <Chip label={notice.category || "General"} size="small" sx={{ mb: 1, fontWeight: 700, fontSize: '0.65rem' }} />
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>{notice.title}</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {notice.content}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Button fullWidth sx={{ mt: 3 }} component={Link} to="/notices">See All Notices</Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
