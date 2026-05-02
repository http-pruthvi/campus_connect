import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  LinearProgress,
  alpha,
  useTheme,
  Avatar,
} from "@mui/material";
import {
  Plus,
  FileText,
  Upload,
  Clock,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  department: string;
  year: string;
  teacherId: string;
  teacherName: string;
  createdAt: any;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  fileName: string;
  submittedAt: any;
  status: "PENDING" | "REVIEWED";
  grade?: string;
}

export default function Assignments() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  // Dialog States
  const [openAdd, setOpenAdd] = useState(false);
  const [openSubmit, setOpenSubmit] = useState(false);
  const [openViewSubmissions, setOpenViewSubmissions] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Form States
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    subject: "",
    year: "1st",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const role = user?.role?.toUpperCase();
  const isTeacher = role === "TEACHER" || role === "HOD" || role === "ADMIN";

  useEffect(() => {
    if (!user) return;
    const q = isTeacher 
      ? query(collection(db, "assignments"), where("teacherId", "==", user.id), orderBy("createdAt", "desc"))
      : query(collection(db, "assignments"), where("department", "==", user.department), where("year", "==", user.year), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isTeacher]);

  const handleCreateAssignment = async () => {
    if (!form.title || !form.dueDate || !form.subject) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "assignments"), {
        ...form,
        department: user?.department,
        teacherId: user?.id,
        teacherName: user?.name,
        createdAt: serverTimestamp(),
      });
      setOpenAdd(false);
      setForm({ title: "", description: "", dueDate: "", subject: "", year: "1st" });
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleSubmitAssignment = async () => {
    if (!file || !selectedAssignment) return;
    setSubmitting(true);
    try {
      const storageRef = ref(storage, `submissions/${selectedAssignment.id}/${user?.id}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "submissions"), {
        assignmentId: selectedAssignment.id,
        studentId: user?.id,
        studentName: user?.name,
        fileUrl: url,
        fileName: file.name,
        submittedAt: serverTimestamp(),
        status: "PENDING",
      });
      setOpenSubmit(false);
      setFile(null);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const fetchSubmissions = async (assignmentId: string) => {
    const q = query(collection(db, "submissions"), where("assignmentId", "==", assignmentId));
    const snap = await getDocs(q);
    setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
  };

  const getStatusColor = (dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date();
    return isOverdue ? theme.palette.error.main : theme.palette.primary.main;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
            Assignments
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and track coursework submissions
          </Typography>
        </Box>
        {isTeacher && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenAdd(true)}
            sx={{ px: 3, py: 1 }}
          >
            New Assignment
          </Button>
        )}
      </Box>

      {loading ? (
        <LinearProgress sx={{ borderRadius: 2 }} />
      ) : (
        <Grid container spacing={3}>
          {assignments.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}>
                <FileText size={48} color={theme.palette.text.disabled} style={{ marginBottom: '16px' }} />
                <Typography variant="h6" color="textSecondary">No assignments found.</Typography>
                {isTeacher && <Typography variant="body2" color="textSecondary">Create your first assignment to get started.</Typography>}
              </Paper>
            </Grid>
          ) : (
            assignments.map((assignment) => (
              <Grid size={{ xs: 12, md: 6 }} key={assignment.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '6px',
                    height: '100%',
                    bgcolor: getStatusColor(assignment.dueDate),
                    borderRadius: '16px 0 0 16px'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip 
                        label={assignment.subject} 
                        size="small" 
                        sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} 
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <Clock size={14} />
                        <Typography variant="caption" fontWeight={600}>
                          Due: {format(new Date(assignment.dueDate), "MMM do")}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {assignment.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {assignment.description}
                    </Typography>
                    <Divider sx={{ my: 2, opacity: 0.6 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>{assignment.teacherName?.charAt(0)}</Avatar>
                      <Typography variant="caption" fontWeight={600}>{assignment.teacherName}</Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {isTeacher ? (
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        startIcon={<Users size={16} />}
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          fetchSubmissions(assignment.id);
                          setOpenViewSubmissions(true);
                        }}
                      >
                        View Submissions
                      </Button>
                    ) : (
                      <Button 
                        fullWidth 
                        variant="contained" 
                        startIcon={<Upload size={16} />}
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setOpenSubmit(true);
                        }}
                      >
                        Submit Assignment
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* DIALOGS */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Assignment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField 
                fullWidth label="Assignment Title" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth label="Subject" 
                value={form.subject} 
                onChange={e => setForm({...form, subject: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth label="Due Date" type="date"
                InputLabelProps={{ shrink: true }}
                value={form.dueDate} 
                onChange={e => setForm({...form, dueDate: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                fullWidth label="Description" multiline rows={4}
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAssignment} disabled={submitting}>
            {submitting ? "Creating..." : "Create Assignment"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSubmit} onClose={() => setOpenSubmit(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Work</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 4, textAlign: 'center' }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="file-upload"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload">
              <IconButton component="span" sx={{ mb: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                <Upload size={32} />
              </IconButton>
            </label>
            <Typography variant="body2" fontWeight={700}>
              {file ? file.name : "Click to upload your assignment"}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Supports PDF, DOC, DOCX (Max 10MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenSubmit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitAssignment} disabled={!file || submitting}>
            {submitting ? "Uploading..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
