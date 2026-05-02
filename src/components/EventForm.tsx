import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  Paper, 
  Typography, 
  Grid,
  CircularProgress
} from "@mui/material";

export default function EventForm({ onAdded }) {
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !date || !time || !location) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "events"), {
        title,
        description,
        category,
        date,
        time,
        location,
        postedBy: user?.name || "Admin",
        role: user?.role || "UNKNOWN",
        registrations: [], // Array of objects: { id, name, email }
        timestamp: serverTimestamp(),
      });

      alert("Event published successfully!");
      setTitle("");
      setDescription("");
      setCategory("Technical");
      setDate("");
      setTime("");
      setLocation("");
      
      if (onAdded) onAdded();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to publish event.");
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} className="slide-up">
      <Typography variant="h6" fontWeight="bold" mb={3} color="primary.main">
        Publish New Event
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Cultural">Cultural</MenuItem>
              <MenuItem value="Workshop">Workshop</MenuItem>
              <MenuItem value="Sports">Sports</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="time"
              label="Time"
              InputLabelProps={{ shrink: true }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Event Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Publish Event"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
