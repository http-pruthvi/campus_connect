import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  arrayUnion,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import EventForm from "../components/EventForm";
import {
  Container, Typography, Grid, Paper, Box, Button, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider,
  TextField, MenuItem
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("All");

  // RSVP Dialog State
  const [openRsvp, setOpenRsvp] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // View Registrations Dialog State
  const [openViewReg, setOpenViewReg] = useState(false);
  const [viewEvent, setViewEvent] = useState(null);

  const role = user?.role?.trim().toUpperCase();
  const canEdit = ["ADMIN", "HOD", "TEACHER"].includes(role);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "events"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      
      setEvents(data);
      setFilteredEvents(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.category === selectedCategory));
    }
  }, [selectedCategory, events]);

  const handleOpenRsvp = (event) => {
    // If user is already in the registrations array, do nothing
    const isRegistered = event.registrations?.some(reg => reg.id === user?.id) || false;
    if (isRegistered) return;
    
    setSelectedEvent(event);
    setOpenRsvp(true);
  };

  const handleConfirmRsvp = async () => {
    if (!selectedEvent || !user) return;
    setRsvpLoading(true);

    try {
      const eventRef = doc(db, "events", selectedEvent.id);
      const studentData = {
        id: user.id,
        name: user.name || "Unknown Student",
        email: user.email || "No Email",
        registeredAt: new Date().toISOString()
      };

      await updateDoc(eventRef, {
        registrations: arrayUnion(studentData)
      });

      setOpenRsvp(false);
      setSelectedEvent(null);
      // Refresh events to show updated button state
      fetchEvents();
    } catch (error) {
      console.error("RSVP Error:", error);
      alert("Failed to register for the event. Please try again.");
    }
    setRsvpLoading(false);
  };

  const handleViewRegistrations = (event) => {
    setViewEvent(event);
    setOpenViewReg(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      fetchEvents();
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Technical": return "primary";
      case "Cultural": return "secondary";
      case "Workshop": return "success";
      case "Sports": return "warning";
      case "Other": return "info";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const categories = ["All", "Technical", "Cultural", "Workshop", "Sports", "Other"];

  return (
    <Container sx={{ mt: 4, mb: 4 }} className="fade-in">
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center", fontWeight: "bold", background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="slide-down">
        Upcoming Campus Events
      </Typography>

      {/* Render Event Form if Admin/Teacher */}
      {canEdit && <EventForm onAdded={fetchEvents} />}

      {/* Filter Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <TextField
          select
          size="small"
          label="Filter by Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
      </Box>

      {filteredEvents.length === 0 ? (
        <Typography textAlign="center" color="textSecondary" mt={4}>
          No events found in this category.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {filteredEvents.map((event, index) => {
            const isRegistered = event.registrations?.some(reg => reg.id === user?.id);
            const regCount = event.registrations?.length || 0;

            return (
              <Grid item xs={12} md={6} key={event.id}>
                <Paper className={`slide-up delay-${(index % 4) + 1}`} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.1)', height: "100%", display: "flex", flexDirection: "column", transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      {event.title}
                    </Typography>
                    <Chip label={event.category} color={getCategoryColor(event.category)} size="small" />
                  </Box>

                  <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{event.date}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{event.time}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2} color="text.secondary">
                    <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{event.location}</Typography>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 3, flexGrow: 1 }}>
                    {event.description}
                  </Typography>

                  <Box display="flex" gap={2} mt="auto">
                    <Button 
                      variant={isRegistered ? "outlined" : "contained"} 
                      color={isRegistered ? "success" : "primary"}
                      fullWidth
                      onClick={() => handleOpenRsvp(event)}
                      disabled={isRegistered}
                    >
                      {isRegistered ? "Registered ✓" : "RSVP Now"}
                    </Button>

                    {canEdit && (
                      <>
                        <Button 
                          variant="outlined" 
                          color="info"
                          onClick={() => handleViewRegistrations(event)}
                          title="View Registrations"
                          sx={{ minWidth: 'auto', px: 2 }}
                        >
                          <GroupIcon sx={{ mr: 1 }} /> {regCount}
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleDeleteEvent(event.id)}
                          sx={{ minWidth: 'auto' }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* RSVP Dialog */}
      <Dialog open={openRsvp} onClose={() => setOpenRsvp(false)}>
        <DialogTitle>Confirm Registration</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Are you sure you want to register for <strong>{selectedEvent?.title}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Location: {selectedEvent?.location}<br/>
            Date: {selectedEvent?.date}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRsvp(false)} disabled={rsvpLoading}>Cancel</Button>
          <Button onClick={handleConfirmRsvp} variant="contained" color="primary" disabled={rsvpLoading}>
            {rsvpLoading ? <CircularProgress size={24} color="inherit" /> : "Confirm RSVP"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Registrations Dialog (Admin Only) */}
      <Dialog open={openViewReg} onClose={() => setOpenViewReg(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Registered Students</Typography>
            <Chip label={`${viewEvent?.registrations?.length || 0} Total`} color="primary" />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {(!viewEvent?.registrations || viewEvent.registrations.length === 0) ? (
            <Typography color="textSecondary" textAlign="center" py={3}>
              No students have registered for this event yet.
            </Typography>
          ) : (
            <List>
              {viewEvent.registrations.map((student, idx) => (
                <React.Fragment key={student.id + idx}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={student.name} 
                      secondary={student.email} 
                    />
                  </ListItem>
                  {idx < viewEvent.registrations.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewReg(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
