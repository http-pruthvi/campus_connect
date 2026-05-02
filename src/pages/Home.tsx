import React, { useEffect, useState } from "react";
import { 
  Container, 
  Typography, 
  Grid2 as Grid, 
  Paper, 
  Button, 
  Box, 
  Avatar, 
  useTheme, 
  alpha,
  LinearProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Assignment as AssignmentIcon, 
  Group as GroupsIcon, 
  CheckCircle as CheckCircleIcon,
  Schedule as ClockIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  NotificationsActive as AlertIcon,
  EmojiEvents as TrophyIcon,
  Chat as MessageSquare
} from "@mui/icons-material";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import "../styles/Home.css";
export default function Home() {
  const theme = useTheme();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserStr = localStorage.getItem("user");
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser?.name) setUserName(storedUser.name);
        if (storedUser?.role) setRole(storedUser.role);
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }

    const q = query(
      collection(db, "notices"),
      orderBy("timestamp", "desc"),
      limit(4)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentNotices(data);
    });

    return () => unsub();
  }, []);

  const stats = [
    { label: 'Overall Attendance', value: '82%', icon: <TrendingUp />, color: '#10B981', trend: '+2% from last week' },
    { label: 'Assignments', value: '12', icon: <AssignmentIcon />, color: '#3B82F6', trend: '3 pending submission' },
    { label: 'Course Progress', value: '64%', icon: <GroupsIcon />, color: '#8B5CF6', trend: 'On track' },
    { label: 'Events Registered', value: '4', icon: <TrophyIcon />, color: '#F59E0B', trend: 'Next: Tech Fest' },
  ];

  return (
    <Container maxWidth="xl" sx={{ pb: 8 }} className="fade-in">
      {/* Welcome Header */}
      <Box sx={{ mb: 6, mt: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" fontWeight={900} sx={{ mb: 1, letterSpacing: '-0.5px' }}>
              Welcome back, {userName || 'Scholar'}! 👋
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Here's what's happening on campus today. You have <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>3 upcoming tasks</Box> and 1 new notice.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
            <Button 
              variant="contained" 
              startIcon={<ClockIcon />}
              onClick={() => navigate('/timetable')}
              sx={{ borderRadius: 3, px: 3, py: 1.5, boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}` }}
            >
              View Schedule
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 5, 
              position: 'relative', 
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, width: 44, height: 44 }}>
                  {stat.icon}
                </Avatar>
                <IconButton size="small" sx={{ ml: 'auto' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5 }}>{stat.value}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5, fontWeight: 600 }}>{stat.label}</Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 14 }} /> {stat.trend}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Main Content Area */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 5, mb: 4, bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h6" fontWeight={800}>Attendance Overview</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/attendance')}>Detailed Report</Button>
            </Box>
            
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={700}>CS-401: Advanced Algorithms</Typography>
                    <Typography variant="body2" color="primary" fontWeight={800}>88%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={88} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={700}>MA-202: Linear Algebra</Typography>
                    <Typography variant="body2" color="secondary" fontWeight={800}>72%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={72} color="secondary" sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.secondary.main, 0.1) }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={700}>HS-101: Communication Skills</Typography>
                    <Typography variant="body2" sx={{ color: '#F59E0B' }} fontWeight={800}>95%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={95} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#F59E0B', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' } }} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 140, 
                    height: 140, 
                    borderRadius: '50%', 
                    border: '10px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    borderTopColor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    transform: 'rotate(45deg)'
                  }}>
                    <Typography variant="h4" fontWeight={900} sx={{ transform: 'rotate(-45deg)' }}>82%</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700} color="textSecondary">Average Attendance</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 5, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Quick Actions</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Submit Work', icon: <AssignmentIcon />, path: '/assignments', color: '#EF4444' },
                    { label: 'Find Mentor', icon: <GroupsIcon />, path: '/mentorship', color: '#10B981' },
                    { label: 'Report Item', icon: <AlertIcon />, path: '/lostfound', color: '#F59E0B' },
                    { label: 'Join Chat', icon: <MessageSquare />, path: '/chat', color: '#8B5CF6' },
                  ].map((action, i) => (
                    <Grid size={{ xs: 6 }} key={i}>
                      <Button
                        fullWidth
                        onClick={() => navigate(action.path)}
                        sx={{
                          flexDirection: 'column',
                          py: 2,
                          gap: 1,
                          borderRadius: 4,
                          bgcolor: alpha(action.color, 0.05),
                          color: action.color,
                          border: `1px solid ${alpha(action.color, 0.1)}`,
                          '&:hover': { bgcolor: alpha(action.color, 0.1) }
                        }}
                      >
                        {action.icon}
                        <Typography variant="caption" fontWeight={700}>{action.label}</Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 5, height: '100%', bgcolor: 'primary.main', color: '#fff' }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Upcoming Event</Typography>
                <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>Annual Tech Fest 2026</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <ClockIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>Starts in 3 days • Auditorium 1</Typography>
                </Box>
                <Button variant="contained" sx={{ bgcolor: '#fff', color: 'primary.main', fontWeight: 800, '&:hover': { bgcolor: '#f0f0f0' } }}>
                  Register Now
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar Activity Feed */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 5, height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Recent Notices</Typography>
              <IconButton size="small"><ArrowForwardIcon fontSize="small" /></IconButton>
            </Box>
            
            <List disablePadding>
              {recentNotices.length > 0 ? recentNotices.map((notice, i) => (
                <ListItem key={notice.id} disablePadding sx={{ mb: 2, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={notice.title}
                    secondary={notice.description}
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem', mb: 0.5 }}
                    secondaryTypographyProps={{ 
                      sx: { 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        fontSize: '0.75rem'
                      } 
                    }}
                  />
                </ListItem>
              )) : (
                <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ py: 4 }}>
                  No recent notices.
                </Typography>
              )}
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Upcoming Deadlines</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { title: 'Algorithms Quiz', time: 'Tomorrow, 10:00 AM', type: 'Quiz' },
                { title: 'Project Proposal', time: 'In 2 days', type: 'Assignment' },
                { title: 'Fees Payment', time: 'In 5 days', type: 'Financial' },
              ].map((item, i) => (
                <Box key={i} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.text.primary, 0.03), borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                  <Typography variant="body2" fontWeight={800}>{item.title}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="textSecondary">{item.time}</Typography>
                    <Typography variant="caption" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', px: 1, py: 0.2, borderRadius: 1, fontWeight: 700 }}>
                      {item.type}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
