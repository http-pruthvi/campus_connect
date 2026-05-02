import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Download,
  Plus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MarkRecord {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  internal: number;
  midSem: number;
  endSem: number;
  total: number;
  grade: string;
  updatedAt: any;
}

export default function Grades() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("Mathematics III");
  const [selectedYear, setSelectedYear] = useState("1st");

  // Add Dialog State
  const [openAdd, setOpenAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    internal: 0,
    midSem: 0,
    endSem: 0,
  });

  const role = user?.role?.toUpperCase();
  const isTeacher = role === "TEACHER" || role === "HOD" || role === "ADMIN";

  const subjects = [
    "Mathematics III",
    "Data Structures",
    "Digital Logic Design",
    "Operating Systems",
    "Cloud Computing",
  ];

  useEffect(() => {
    fetchData();
  }, [selectedSubject, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch marks for subject
      const q = query(collection(db, "marks"), where("subject", "==", selectedSubject));
      const snap = await getDocs(q);
      const markData = snap.docs.map(d => ({ id: d.id, ...d.data() } as MarkRecord));
      setMarks(markData);

      if (isTeacher) {
        // Fetch students to mark
        const sq = query(
          collection(db, "users"), 
          where("role", "==", "STUDENT"),
          where("department", "==", user?.department),
          where("year", "==", selectedYear)
        );
        const sSnap = await getDocs(sq);
        setStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const calculateGrade = (total: number) => {
    if (total >= 90) return "O";
    if (total >= 80) return "A+";
    if (total >= 70) return "A";
    if (total >= 60) return "B+";
    if (total >= 50) return "B";
    if (total >= 40) return "C";
    return "F";
  };

  const handleSaveMarks = async () => {
    const student = students.find(s => s.id === form.studentId);
    if (!student) return;

    setSubmitting(true);
    const total = Number(form.internal) + Number(form.midSem) + Number(form.endSem);
    const grade = calculateGrade(total);

    try {
      const markId = `${form.studentId}_${selectedSubject.replace(/\s+/g, '_')}`;
      await setDoc(doc(db, "marks", markId), {
        studentId: form.studentId,
        studentName: student.name,
        subject: selectedSubject,
        internal: Number(form.internal),
        midSem: Number(form.midSem),
        endSem: Number(form.endSem),
        total,
        grade,
        updatedAt: serverTimestamp(),
      });
      setOpenAdd(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const downloadMarksheet = (record: MarkRecord) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Campus Connect - Academic Marksheet", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Student Name: ${record.studentName}`, 20, 40);
    doc.text(`Subject: ${record.subject}`, 20, 50);
    doc.text(`Academic Year: ${selectedYear}`, 20, 60);

    autoTable(doc, {
      startY: 70,
      head: [['Assessment', 'Max Marks', 'Obtained']],
      body: [
        ['Internal Assessment', '20', record.internal],
        ['Mid-Semester Exam', '30', record.midSem],
        ['End-Semester Exam', '50', record.endSem],
        ['Total Score', '100', record.total],
      ],
      theme: 'grid',
      headStyles: { fillColor: theme.palette.primary.main }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(16);
    doc.text(`Final Grade: ${record.grade}`, 105, finalY + 20, { align: "center" });
    
    doc.save(`Marksheet_${record.studentName}_${record.subject}.pdf`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
            Marks & Grades
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Academic performance tracking and marksheet generation
          </Typography>
        </Box>
        {isTeacher && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenAdd(true)}
          >
            Add Marks
          </Button>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select value={selectedSubject} label="Subject" onChange={e => setSelectedSubject(e.target.value as string)}>
              {subjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {isTeacher && (
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Target Year</InputLabel>
              <Select value={selectedYear} label="Target Year" onChange={e => setSelectedYear(e.target.value as string)}>
                <MenuItem value="1st">1st Year</MenuItem>
                <MenuItem value="2nd">2nd Year</MenuItem>
                <MenuItem value="3rd">3rd Year</MenuItem>
                <MenuItem value="4th">4th Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Internal (20)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Mid-Sem (30)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>End-Sem (50)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Total (100)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Grade</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="textSecondary">No marks recorded for this subject yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              marks.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>{record.studentName.charAt(0)}</Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>{record.studentName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{record.internal}</TableCell>
                  <TableCell align="center">{record.midSem}</TableCell>
                  <TableCell align="center">{record.endSem}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>{record.total}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={record.grade} 
                      color={record.grade === 'F' ? 'error' : 'success'} 
                      size="small" 
                      sx={{ fontWeight: 800, minWidth: 40 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download Marksheet">
                      <IconButton color="primary" onClick={() => downloadMarksheet(record)}>
                        <Download size={20} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Record Student Marks</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Select Student</InputLabel>
                <Select 
                  value={form.studentId} 
                  label="Select Student"
                  onChange={e => setForm({...form, studentId: e.target.value as string})}
                >
                  {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.email})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                fullWidth label="Internal (20)" type="number"
                value={form.internal} 
                onChange={e => setForm({...form, internal: Number(e.target.value)})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                fullWidth label="Mid-Sem (30)" type="number"
                value={form.midSem} 
                onChange={e => setForm({...form, midSem: Number(e.target.value)})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                fullWidth label="End-Sem (50)" type="number"
                value={form.endSem} 
                onChange={e => setForm({...form, endSem: Number(e.target.value)})} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMarks} disabled={submitting}>
            {submitting ? "Saving..." : "Save Marks"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
