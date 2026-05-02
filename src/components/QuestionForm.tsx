import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { TextField, Button, Box } from "@mui/material";

interface QuestionFormProps {
  userData: {
    id: string;
    department?: string;
    year?: string;
  };
  onAdded?: () => void;
}

export default function QuestionForm({ userData, onAdded }: QuestionFormProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    await addDoc(collection(db, "mentorshipQuestions"), {
      question,
      askedBy: userData.id,
      department: userData.department || "General",
      year: userData.year || "N/A",
      date: serverTimestamp(),
      answers: []
    });

    setQuestion("");
    if (onAdded) onAdded();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField
        label="Ask a question"
        fullWidth
        multiline
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        sx={{ mb: 2 }}
        required
      />
      <Button variant="contained" type="submit">Post Question</Button>
    </Box>
  );
}
