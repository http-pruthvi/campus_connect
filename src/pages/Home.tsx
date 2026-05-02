import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Paper, Button, Box, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import "../styles/Home.css";

export default function Home() {
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState({
    notices: false,
    lostFound: false,
    mentorship: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.name) setUserName(storedUser.name);

    const checkUpdates = (collectionName, key) => {
      const q = query(
        collection(db, collectionName),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          const lastSeen = localStorage.getItem(`lastSeen_${collectionName}`);
          const latestTime = latestDoc.data().timestamp?.toMillis?.() || 0;
          if (!lastSeen || latestTime > parseInt(lastSeen)) {
            setNotifications((prev) => ({ ...prev, [key]: true }));
          }
        }
      });
    };

    const unsubNotices = checkUpdates("notices", "notices");
    const unsubLostFound = checkUpdates("lostFound", "lostFound");
    const unsubMentorship = checkUpdates("queries", "mentorship");

    return () => {
      unsubNotices();
      unsubLostFound();
      unsubMentorship();
    };
  }, []);

  const handleNavigation = (section, path) => {
    localStorage.setItem(`lastSeen_${section}`, Date.now().toString());
    setNotifications((prev) => ({ ...prev, [section]: false }));
    navigate(path);
  };

  const sections = [
    {
      id: "notices",
      title: "Notices",
      path: "/notices",
      desc: "Stay updated with the latest announcements and notices.",
      btnText: "View Notices",
      icon: <AssignmentIcon sx={{ fontSize: 40, color: '#4F46E5' }} />,
      delayClass: "delay-1",
      hasNotification: notifications.notices
    },
    {
      id: "events",
      title: "Events",
      path: "/events",
      desc: "Discover upcoming workshops, seminars, and cultural events.",
      btnText: "View Events",
      icon: <EventIcon sx={{ fontSize: 40, color: '#0EA5E9' }} />,
      delayClass: "delay-2",
      hasNotification: false
    },
    {
      id: "lostFound",
      title: "Lost & Found",
      path: "/lostfound",
      desc: "Report or claim lost items quickly and efficiently.",
      btnText: "Access Portal",
      icon: <SearchIcon sx={{ fontSize: 40, color: '#F59E0B' }} />,
      delayClass: "delay-3",
      hasNotification: notifications.lostFound
    },
    {
      id: "mentorship",
      title: "Mentorship",
      path: "/queries",
      desc: "Connect with mentors for academic and career guidance.",
      btnText: "Find a Mentor",
      icon: <PersonIcon sx={{ fontSize: 40, color: '#10B981' }} />,
      delayClass: "delay-4",
      hasNotification: notifications.mentorship
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }} className="fade-in">
      <Box sx={{ textAlign: 'center', mb: 6 }} className="slide-down">
        <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {userName ? `Welcome, ${userName}` : "Welcome to Campus Connect"}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Your all-in-one student engagement platform.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {sections.map((sec) => (
          <Grid item xs={12} sm={6} md={3} key={sec.id}>
            <Paper 
              className={`slide-up ${sec.delayClass}`}
              sx={{ 
                p: 4, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                }
              }}
              onClick={() => handleNavigation(sec.id, sec.path)}
            >
              <Avatar sx={{ width: 80, height: 80, mb: 3, bgcolor: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {sec.icon}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sec.title}
                {sec.hasNotification && <span className="notification-dot" />}
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 4, flexGrow: 1 }}>
                {sec.desc}
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation(sec.id, sec.path);
                }}
              >
                {sec.btnText}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
