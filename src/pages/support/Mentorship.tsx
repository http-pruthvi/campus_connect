import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { 
  Container, Card, CardContent, Typography, TextField, 
  Button, Grid2 as Grid, Box, Avatar, Divider, Chip, alpha, useTheme 
} from "@mui/material";
import QuestionForm from "../../components/QuestionForm";
import { useAuth } from "../../context/AuthContext";
import ForumIcon from '@mui/icons-material/Forum';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PersonIcon from '@mui/icons-material/Person';

interface Answer {
  answeredBy: string;
  answer: string;
  date: any;
}

interface MentorshipQuestion {
  id: string;
  question: string;
  askedBy: string;
  department: string;
  year: string;
  answers: Answer[];
  timestamp: any;
}

export default function Mentorship() {
  const { user: userData } = useAuth();
  const theme = useTheme();
  const [questions, setQuestions] = useState<MentorshipQuestion[]>([]);
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});

  const fetchQuestions = async () => {
    try {
      const snapshot = await getDocs(collection(db, "mentorshipQuestions"));
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MentorshipQuestion)));
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (userData) fetchQuestions();
  }, [userData]);

  const handleAnswerChange = (qId: string, value: string) => {
    setAnswerInputs(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmitAnswer = async (qId: string) => {
    const answerText = answerInputs[qId];
    if (!answerText || !userData) return;

    try {
      const qDoc = doc(db, "mentorshipQuestions", qId);
      await updateDoc(qDoc, {
        answers: arrayUnion({
          answeredBy: userData.name,
          answer: answerText,
          date: new Date()
        })
      });

      setAnswerInputs(prev => ({ ...prev, [qId]: "" }));
      fetchQuestions();
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const role = userData?.role?.toLowerCase();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="fade-in">
      <Box sx={{ mb: 4, textAlign: 'center' }} className="slide-down">
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 1 }}>
          Peer Mentorship & Q&A
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Connect with seniors, teachers, and peers to solve your academic doubts.
        </Typography>
      </Box>

      {userData && role === "student" && (
        <Box sx={{ mb: 6 }} className="slide-up delay-1">
          <QuestionForm userData={userData} onAdded={fetchQuestions} />
        </Box>
      )}

      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ForumIcon color="primary" /> Recent Discussions
      </Typography>

      <Grid container spacing={3}>
        {questions.length === 0 ? (
          <Grid size={12}>
            <Box sx={{ py: 8, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 4, border: '2px dashed', borderColor: 'divider' }}>
              <QuestionAnswerIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="textSecondary">No discussions yet. Be the first to ask a question!</Typography>
            </Box>
          </Grid>
        ) : (
          questions.map((q, index) => (
            <Grid size={12} key={q.id}>
              <Card 
                className={`slide-up delay-${(index % 3) + 1}`}
                sx={{ 
                  borderRadius: 4, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  boxShadow: 'none',
                  '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.01) }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>{q.question}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="caption" fontWeight={600} color="textSecondary">
                          By {q.askedBy}
                        </Typography>
                        <Typography variant="caption" color="textDisabled">•</Typography>
                        <Chip label={q.department} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        <Chip label={`${q.year} Year`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QuestionAnswerIcon sx={{ fontSize: 18 }} /> {q.answers?.length || 0} Answers
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                      {q.answers?.map((a, idx) => (
                        <Box key={idx} sx={{ pl: 3, borderLeft: '3px solid', borderColor: alpha(theme.palette.primary.main, 0.2), py: 0.5 }}>
                          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>{a.answer}</Typography>
                          <Typography variant="caption" color="textSecondary" fontWeight={600}>
                            — {a.answeredBy}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {userData && ["teacher", "hod", "admin"].includes(role || "") && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 3 }}>
                        <TextField
                          placeholder="Share your expertise..."
                          fullWidth
                          variant="outlined"
                          size="small"
                          multiline
                          rows={2}
                          value={answerInputs[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          sx={{ mb: 1.5, bgcolor: 'background.paper' }}
                        />
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={() => handleSubmitAnswer(q.id)}
                          disabled={!answerInputs[q.id]}
                          sx={{ px: 3, fontWeight: 700 }}
                        >
                          Submit Answer
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}
