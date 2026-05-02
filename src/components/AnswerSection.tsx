import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Box, TextField, Button, CircularProgress, alpha, useTheme } from "@mui/material";
import ReplyIcon from '@mui/icons-material/Reply';

interface AnswerSectionProps {
  queryId: string;
}

export default function AnswerSection({ queryId }: AnswerSectionProps) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, `queries/${queryId}/replies`), {
        text: text.trim(),
        repliedBy: name.trim() || "Anonymous",
        time: serverTimestamp(),
      });
      setText("");
      setName("");
    } catch (err) {
      console.error("Reply failed:", err);
    }
    setLoading(false);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleReply} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1.5, 
        p: 2, 
        bgcolor: alpha(theme.palette.primary.main, 0.03), 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <TextField
        size="small"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        variant="outlined"
        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
      />
      <TextField
        size="small"
        placeholder="Write your answer..."
        multiline
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        variant="outlined"
        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained" 
          size="small"
          disabled={loading || !text.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <ReplyIcon />}
          sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
        >
          {loading ? "Posting..." : "Post Reply"}
        </Button>
      </Box>
    </Box>
  );
}
