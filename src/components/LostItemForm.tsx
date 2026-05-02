import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Paper, Typography, TextField, Button, Grid, CircularProgress, Box } from "@mui/material";
import { uploadImageToImgBB } from "../utils/imageUpload";

const LostItemForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      // Upload image using centralized utility
      if (image) {
        imageUrl = await uploadImageToImgBB(image);
      }

      await addDoc(collection(db, "lost_items"), {
        title,
        description,
        category,
        location,
        imageUrl,
        date_reported: serverTimestamp(),
        status: "lost",
      });

      alert("Lost item reported successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setImage(null);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to report item. Try again.");
    }

    setLoading(false);
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
      <Typography variant="h6" fontWeight="bold" mb={3} color="primary.main">
        Report Lost Item
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Category (phone, wallet, keys...)"
              variant="outlined"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              variant="outlined"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ border: '1px dashed #cbd5e1', p: 2, borderRadius: 2, textAlign: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                style={{ width: '100%' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Report"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default LostItemForm;
