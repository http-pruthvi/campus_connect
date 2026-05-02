import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  alpha,
  useTheme,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Save,
  Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

interface TimeSlot {
  id: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface TimetableData {
  [day: string]: TimeSlot[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:15 AM - 12:15 PM",
  "12:15 PM - 01:15 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
];

export default function Timetable() {
  const { user } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<TimetableData>({});
  
  // Selection
  const [selectedYear, setSelectedYear] = useState(user?.year || "1st");
  const [selectedDept, setSelectedDept] = useState(user?.department || "Computer Engineering");

  // Edit State
  const [openEdit, setOpenAdd] = useState(false);
  const [editingDay, setEditingDay] = useState("");
  const [newSlot, setNewSlot] = useState({
    subject: "",
    teacher: "",
    startTime: "",
    endTime: "",
    room: "",
  });

  const role = user?.role?.toUpperCase();
  const canEdit = role === "ADMIN" || role === "HOD";

  useEffect(() => {
    const timetableId = `${selectedDept.replace(/\s+/g, '_')}_${selectedYear}`;
    const unsubscribe = onSnapshot(doc(db, "timetables", timetableId), (doc) => {
      if (doc.exists()) {
        setTimetable(doc.data().schedule || {});
      } else {
        setTimetable({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedYear, selectedDept]);

  const handleAddSlot = async () => {
    const timetableId = `${selectedDept.replace(/\s+/g, '_')}_${selectedYear}`;
    const daySchedule = timetable[editingDay] || [];
    const updatedSchedule = {
      ...timetable,
      [editingDay]: [...daySchedule, { ...newSlot, id: Date.now().toString() }]
    };

    try {
      await setDoc(doc(db, "timetables", timetableId), {
        schedule: updatedSchedule,
        updatedAt: serverTimestamp(),
        updatedBy: user?.name,
      });
      setOpenAdd(false);
      setNewSlot({ subject: "", teacher: "", startTime: "", endTime: "", room: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const removeSlot = async (day: string, slotId: string) => {
    if (!confirm("Remove this slot?")) return;
    const timetableId = `${selectedDept.replace(/\s+/g, '_')}_${selectedYear}`;
    const updatedDaySchedule = timetable[day].filter(s => s.id !== slotId);
    const updatedSchedule = { ...timetable, [day]: updatedDaySchedule };

    try {
      await setDoc(doc(db, "timetables", timetableId), { schedule: updatedSchedule }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
            Weekly Timetable
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {selectedDept} • {selectedYear} Year
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {canEdit && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} label="Year" onChange={e => setSelectedYear(e.target.value)}>
                <MenuItem value="1st">1st Year</MenuItem>
                <MenuItem value="2nd">2nd Year</MenuItem>
                <MenuItem value="3rd">3rd Year</MenuItem>
                <MenuItem value="4th">4th Year</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button variant="outlined" startIcon={<Download size={18} />}>Export PDF</Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, n) => setActiveTab(n)} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            px: 2, pt: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          {DAYS.map((day) => (
            <Tab key={day} label={day} sx={{ fontWeight: 700, minWidth: 120 }} />
          ))}
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={3}>
            {timetable[DAYS[activeTab]]?.length > 0 ? (
              timetable[DAYS[activeTab]]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((slot) => (
                <Grid item xs={12} sm={6} md={4} key={slot.id}>
                  <Card sx={{ 
                    position: 'relative', 
                    bgcolor: alpha(theme.palette.primary.main, 0.01),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03), transform: 'translateY(-2px)' },
                    transition: 'all 0.2s'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight={800} color="primary">
                          {slot.startTime} - {slot.endTime}
                        </Typography>
                        {canEdit && (
                          <IconButton size="small" color="error" onClick={() => removeSlot(DAYS[activeTab], slot.id)}>
                            <Trash2 size={14} />
                          </IconButton>
                        )}
                      </Box>
                      <Typography variant="h6" fontWeight={700}>{slot.subject}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
                        <Edit2 size={14} />
                        <Typography variant="body2" fontWeight={500}>{slot.teacher}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'text.secondary' }}>
                        <Clock size={14} />
                        <Typography variant="body2" fontWeight={500}>Room: {slot.room}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Calendar size={48} color={theme.palette.text.disabled} style={{ marginBottom: '16px' }} />
                  <Typography variant="h6" color="textSecondary">No classes scheduled for {DAYS[activeTab]}.</Typography>
                  {canEdit && (
                    <Button 
                      variant="contained" 
                      startIcon={<Plus size={18} />} 
                      sx={{ mt: 2 }}
                      onClick={() => { setEditingDay(DAYS[activeTab]); setOpenAdd(true); }}
                    >
                      Add Session
                    </Button>
                  )}
                </Box>
              </Grid>
            )}
            
            {canEdit && timetable[DAYS[activeTab]]?.length > 0 && (
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="dashed"
                  sx={{ 
                    height: '100%', minHeight: 140, 
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 4,
                    color: 'text.secondary',
                    '&:hover': { border: `2px dashed ${theme.palette.primary.main}`, color: 'primary.main' }
                  }}
                  onClick={() => { setEditingDay(DAYS[activeTab]); setOpenAdd(true); }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Plus size={24} />
                    <Typography fontWeight={700}>Add Class</Typography>
                  </Box>
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* ADD SLOT DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Schedule Class: {editingDay}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Subject Name" fullWidth value={newSlot.subject} onChange={e => setNewSlot({...newSlot, subject: e.target.value})} />
            <TextField label="Teacher Name" fullWidth value={newSlot.teacher} onChange={e => setNewSlot({...newSlot, teacher: e.target.value})} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Start Time" placeholder="09:00 AM" fullWidth value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} />
              <TextField label="End Time" placeholder="10:00 AM" fullWidth value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} />
            </Box>
            <TextField label="Room / Lab" fullWidth value={newSlot.room} onChange={e => setNewSlot({...newSlot, room: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSlot}>Save Session</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

import { Card, CardContent } from "@mui/material";
