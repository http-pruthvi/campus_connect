import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { Container, Card, CardContent, Typography, TextField, Button, Grid, Box } from "@mui/material";
import QuestionForm from "../components/QuestionForm";

export default function Mentorship({ userData }) {
  const [questions, setQuestions] = useState([]);
  const [answerInputs, setAnswerInputs] = useState({}); // track input per question

  const fetchQuestions = async () => {
    const snapshot = await getDocs(collection(db, "mentorshipQuestions"));
    setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (userData) fetchQuestions();
  }, [userData]);

  const handleAnswerChange = (qId, value) => {
    setAnswerInputs(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmitAnswer = async (qId) => {
    const answerText = answerInputs[qId];
    if (!answerText || !userData) return;

    const qDoc = doc(db, "mentorshipQuestions", qId);
    await updateDoc(qDoc, {
      answers: arrayUnion({
        answeredBy: userData.uid,
        answer: answerText,
        date: new Date()
      })
    });

    setAnswerInputs(prev => ({ ...prev, [qId]: "" }));
    fetchQuestions();
  };

  return (
    <Container sx={{ mt: 4 }}>
      {/* Students can post questions */}
      {userData && userData.role === "student" && (
        <QuestionForm userData={userData} onAdded={fetchQuestions} />
      )}

      <Grid container spacing={2}>
        {questions.map(q => (
          <Grid item xs={12} key={q.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{q.question}</Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                  Asked by: {q.askedBy} | {q.department} | {q.year}
                </Typography>

                {/* Display answers */}
                {q.answers.map((a, idx) => (
                  <Box key={idx} sx={{ mb: 1, pl: 2, borderLeft: "2px solid #ccc" }}>
                    <Typography variant="body2">{a.answer}</Typography>
                    <Typography variant="caption">Answered by: {a.answeredBy}</Typography>
                  </Box>
                ))}

                {/* Teachers/HOD/Admin can answer */}
                {userData && ["teacher", "hod", "admin"].includes(userData.role) && (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      placeholder="Write an answer"
                      fullWidth
                      value={answerInputs[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Button size="small" variant="contained" onClick={() => handleSubmitAnswer(q.id)}>
                      Submit Answer
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
