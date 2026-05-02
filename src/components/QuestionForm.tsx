import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { TextField, Button, Box } from "@mui/material";

export default function QuestionForm({ userData, onAdded }) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    await addDoc(collection(db, "mentorshipQuestions"), {
      question,
      askedBy: userData.uid,
      department: userData.department,
      year: userData.year,
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
