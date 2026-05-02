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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  alpha,
  useTheme,
  TextField,
} from "@mui/material";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Info,
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
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { format } from "date-fns";

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
}

interface AttendanceRecord {
  status: "PRESENT" | "ABSENT" | "LATE";
  lastUpdated: string;
}

export default function Attendance() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Selection State
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedYear, setSelectedYear] = useState(user?.year || "1st");
  const [selectedDept, setSelectedDept] = useState(user?.department || "Computer Engineering");

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});

  const role = user?.role?.toUpperCase();
  const isTeacher = role === "TEACHER" || role === "HOD" || role === "ADMIN";

  const subjects = [
    "Mathematics III",
    "Data Structures",
    "Digital Logic Design",
    "Operating Systems",
    "Cloud Computing",
  ];

  const [studentRecords, setStudentRecords] = useState<any[]>([]);

  useEffect(() => {
    if (isTeacher) {
      fetchStudents();
    } else {
      fetchStudentAttendance();
    }
  }, [selectedYear, selectedDept, selectedSubject, selectedDate]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "STUDENT"),
        where("department", "==", selectedDept),
        where("year", "==", selectedYear)
      );
      const snapshot = await getDocs(q);
      const studentData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
      setStudents(studentData);

      if (selectedSubject) {
        const attendanceRef = doc(db, "attendance", `${selectedDate}_${selectedSubject}_${selectedDept}_${selectedYear}`);
        const attendanceSnap = await getDoc(attendanceRef);
        if (attendanceSnap.exists()) {
          setAttendance(attendanceSnap.data().records || {});
        } else {
          setAttendance({});
        }
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
    setLoading(false);
  };

  const fetchStudentAttendance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "attendance"),
        where("department", "==", user.department),
        where("year", "==", user.year)
      );
      const snapshot = await getDocs(q);
      const records: any[] = [];
      snapshot.docs.forEach(d => {
        const data = d.data();
        if (data.records && data.records[user.id]) {
          records.push({
            id: d.id,
            date: data.date,
            subject: data.subject,
            status: data.records[user.id].status,
          });
        }
      });
      setStudentRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Error fetching student attendance:", error);
    }
    setLoading(false);
  };

  const markAttendance = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE") => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        status,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedSubject) return;
    setSaving(true);
    try {
      const attendanceRef = doc(db, "attendance", `${selectedDate}_${selectedSubject}_${selectedDept}_${selectedYear}`);
      await setDoc(attendanceRef, {
        date: selectedDate,
        subject: selectedSubject,
        department: selectedDept,
        year: selectedYear,
        markedBy: user?.name,
        records: attendance,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT": return theme.palette.success.main;
      case "ABSENT": return theme.palette.error.main;
      case "LATE": return theme.palette.warning.main;
      default: return theme.palette.text.disabled;
    }
  };

  if (!isTeacher) {
    const total = studentRecords.length;
    const present = studentRecords.filter(r => r.status === "PRESENT").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
            My Attendance
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Your attendance track record for the current semester
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>Overall Percentage</Typography>
              <Typography variant="h2" fontWeight={800} color={percentage < 75 ? 'error.main' : 'primary.main'}>
                {percentage}%
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={percentage} 
                  sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.1) }} 
                  color={percentage < 75 ? "error" : "primary"}
                />
              </Box>
              <Typography variant="caption" sx={{ mt: 2, display: 'block', fontWeight: 600 }}>
                {percentage < 75 ? "⚠️ Below minimum requirement (75%)" : "✅ Meeting requirements"}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Summary</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={800}>{total}</Typography>
                    <Typography variant="caption" fontWeight={600} color="textSecondary">Total Classes</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05), textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={800} color="success.main">{present}</Typography>
                    <Typography variant="caption" fontWeight={600} color="textSecondary">Present</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05), textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={800} color="error.main">{studentRecords.filter(r => r.status === "ABSENT").length}</Typography>
                    <Typography variant="caption" fontWeight={600} color="textSecondary">Absent</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05), textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={800} color="warning.main">{studentRecords.filter(r => r.status === "LATE").length}</Typography>
                    <Typography variant="caption" fontWeight={600} color="textSecondary">Late</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          {loading && <LinearProgress />}
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary">No attendance records found yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                studentRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{format(new Date(record.date), "MMM do, yyyy")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{record.subject}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={record.status} 
                        size="small" 
                        sx={{ 
                          fontWeight: 800,
                          bgcolor: alpha(getStatusColor(record.status), 0.1),
                          color: getStatusColor(record.status)
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
            Mark Attendance
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {format(new Date(selectedDate), "EEEE, MMMM do, yyyy")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Save size={18} />}
          onClick={handleSave}
          disabled={saving || !selectedSubject}
          sx={{ px: 4, py: 1.2 }}
        >
          {saving ? "Saving..." : "Save Attendance"}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value as string)}>
              <MenuItem value="1st">1st Year</MenuItem>
              <MenuItem value="2nd">2nd Year</MenuItem>
              <MenuItem value="3rd">3rd Year</MenuItem>
              <MenuItem value="4th">4th Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select value={selectedSubject} label="Subject" onChange={(e) => setSelectedSubject(e.target.value as string)}>
              {subjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
           <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info size={18} color={theme.palette.primary.main} />
              <Typography variant="caption" fontWeight={600}>
                Marked: {Object.keys(attendance).length} / {students.length}
              </Typography>
           </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department / Year</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Typography color="textSecondary">No students found for selected criteria.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} hover sx={{ transition: 'all 0.2s' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 700 }}>
                        {student.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{student.name}</Typography>
                        <Typography variant="caption" color="textSecondary">{student.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{student.department}</Typography>
                    <Chip label={`${student.year} Year`} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                  </TableCell>
                  <TableCell align="center">
                    {attendance[student.id] ? (
                      <Chip
                        label={attendance[student.id].status}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: alpha(getStatusColor(attendance[student.id].status), 0.1),
                          color: getStatusColor(attendance[student.id].status),
                          border: `1px solid ${alpha(getStatusColor(attendance[student.id].status), 0.2)}`
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="textDisabled">Not Marked</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Present">
                        <IconButton 
                          onClick={() => markAttendance(student.id, "PRESENT")}
                          sx={{ 
                            color: attendance[student.id]?.status === "PRESENT" ? "white" : "success.main",
                            bgcolor: attendance[student.id]?.status === "PRESENT" ? "success.main" : "transparent",
                            "&:hover": { bgcolor: attendance[student.id]?.status === "PRESENT" ? "success.dark" : alpha(theme.palette.success.main, 0.1) }
                          }}
                        >
                          <CheckCircle2 size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Absent">
                        <IconButton 
                          onClick={() => markAttendance(student.id, "ABSENT")}
                          sx={{ 
                            color: attendance[student.id]?.status === "ABSENT" ? "white" : "error.main",
                            bgcolor: attendance[student.id]?.status === "ABSENT" ? "error.main" : "transparent",
                            "&:hover": { bgcolor: attendance[student.id]?.status === "ABSENT" ? "error.dark" : alpha(theme.palette.error.main, 0.1) }
                          }}
                        >
                          <XCircle size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Late">
                        <IconButton 
                          onClick={() => markAttendance(student.id, "LATE")}
                          sx={{ 
                            color: attendance[student.id]?.status === "LATE" ? "white" : "warning.main",
                            bgcolor: attendance[student.id]?.status === "LATE" ? "warning.main" : "transparent",
                            "&:hover": { bgcolor: attendance[student.id]?.status === "LATE" ? "warning.dark" : alpha(theme.palette.warning.main, 0.1) }
                          }}
                        >
                          <Clock size={20} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
