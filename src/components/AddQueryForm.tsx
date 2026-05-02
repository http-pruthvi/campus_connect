import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 
import { suggestCategory } from "../ml/smartTagger";
import { 
  Box, TextField, Button, Typography, Paper, 
  CircularProgress, Alert, InputAdornment 
} from "@mui/material";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SendIcon from '@mui/icons-material/Send';

interface AddQueryFormProps {
  onQueryAdded?: (data: { id: string; title: string }) => void;
}

export default function AddQueryForm({ onQueryAdded }: AddQueryFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [postedBy, setPostedBy] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "" as "success" | "error" | "info" | "", text: "" });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPostedBy("");
  };

  const handleAutoTag = () => {
    if (!title && !description) {
      setMessage({ type: "info", text: "Please enter a title or description first." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }
    const suggested = suggestCategory(title, description);
    if (suggested) {
      setCategory(suggested);
      setMessage({ type: "success", text: `Suggested category: ${suggested}` });
    } else {
      setMessage({ type: "error", text: "Could not find a matching category." });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage({ type: "error", text: "Please add a title and description." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const queriesRef = collection(db, "queries");
      
      const docRef = await addDoc(queriesRef, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || "General",
        postedBy: postedBy.trim() || "Anonymous",
        date_posted: serverTimestamp(), 
        status: "open", 
      });

      if (onQueryAdded) onQueryAdded({ id: docRef.id, title: title.trim() });

      setMessage({ type: "success", text: "Query posted successfully!" });
      resetForm();
    } catch (err) {
      console.error("Error adding query:", err);
      setMessage({ type: "error", text: "Failed to post. Please try again." });
    }

    setLoading(false);
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        Ask a New Question
      </Typography>

      {message.text && (
        <Alert severity={message.type as any} sx={{ borderRadius: 2 }}>
          {message.text}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Query Title"
        placeholder="e.g., Issue with semester registration"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        variant="outlined"
      />

      <TextField
        fullWidth
        label="Description"
        placeholder="Explain your question or problem in detail..."
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        variant="outlined"
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Category"
          placeholder="e.g., Academics"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button 
                  size="small" 
                  onClick={handleAutoTag}
                  startIcon={<AutoFixHighIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  Auto Tag
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TextField
        fullWidth
        label="Your Name (Optional)"
        placeholder="Anonymous"
        value={postedBy}
        onChange={(e) => setPostedBy(e.target.value)}
        variant="outlined"
      />

      <Button 
        type="submit" 
        variant="contained" 
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        sx={{ mt: 1, py: 1.5, fontWeight: 800, borderRadius: 2 }}
      >
        {loading ? "Posting..." : "Post Query"}
      </Button>
    </Box>
  );
}
