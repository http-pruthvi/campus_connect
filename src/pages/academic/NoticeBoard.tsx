import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { uploadImageToImgBB } from "../../utils/imageUpload";

import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import NoticeForm from "../../components/NoticeForm";
import "../../styles/NoticeBoard.css";

interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  pinned: boolean;
  department: string;
  year: string;
  postedBy: string;
  role: string;
  imageUrl?: string;
  timestamp: any;
}

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // EDIT STATE
  const [editOpen, setEditOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<Partial<Notice> & { newImage?: File } | null>(null);
  const [saving, setSaving] = useState(false);

  const role = user?.role?.trim().toUpperCase();
  const canEdit = ["ADMIN", "HOD", "TEACHER"].includes(role || "");

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noticesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notice[];

      // Sort: Pinned first, then by priority, then by date
      const sortedNotices = [...noticesData].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const priorityOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      setNotices(sortedNotices);
      setFilteredNotices(sortedNotices);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...notices];

    if (selectedDept !== "All") {
      filtered = filtered.filter((n) => n.department === selectedDept || n.department === "All");
    }
    if (selectedYear !== "All") {
      filtered = filtered.filter((n) => n.year === selectedYear || n.year === "All");
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter((n) => n.category === selectedCategory);
    }

    setFilteredNotices(filtered);
  }, [selectedDept, selectedYear, selectedCategory, notices]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await deleteDoc(doc(db, "notices", id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditOpen = (n: Notice) => {
    setEditNotice({
      id: n.id,
      title: n.title,
      description: n.description,
      category: n.category,
      priority: n.priority,
      pinned: n.pinned,
      imageUrl: n.imageUrl,
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditNotice(null);
  };

  const handleSaveEdit = async () => {
    if (!editNotice?.id) return;
    setSaving(true);
    try {
      let imageUrl = editNotice.imageUrl;
      if (editNotice.newImage) {
        imageUrl = await uploadImageToImgBB(editNotice.newImage);
      }

      await updateDoc(doc(db, "notices", editNotice.id), {
        title: editNotice.title,
        description: editNotice.description,
        category: editNotice.category,
        priority: editNotice.priority,
        pinned: editNotice.pinned,
        imageUrl,
      });

      handleEditClose();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        📢 Notice Board
      </Typography>

      {canEdit && <NoticeForm onAdded={() => {}} />}

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Department</InputLabel>
          <Select value={selectedDept} label="Department" onChange={(e) => setSelectedDept(e.target.value as string)}>
            <MenuItem value="All">All Departments</MenuItem>
            <MenuItem value="Computer Engineering">Computer</MenuItem>
            <MenuItem value="Electrical Engineering">Electrical</MenuItem>
            <MenuItem value="Mechanical Engineering">Mechanical</MenuItem>
            <MenuItem value="Civil Engineering">Civil</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value as string)}>
            <MenuItem value="All">All Years</MenuItem>
            <MenuItem value="1st">1st Year</MenuItem>
            <MenuItem value="2nd">2nd Year</MenuItem>
            <MenuItem value="3rd">3rd Year</MenuItem>
            <MenuItem value="4th">4th Year</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value as string)}>
            <MenuItem value="All">All Categories</MenuItem>
            <MenuItem value="Exam">Exam</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Cultural">Cultural</MenuItem>
            <MenuItem value="Urgent">Urgent</MenuItem>
            <MenuItem value="General">General</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }}>
        {filteredNotices.map((n) => (
          <Card key={n.id} elevation={3} sx={{ display: 'flex', flexDirection: 'column' }}>
            {n.imageUrl && (
              <Box sx={{ height: 180, overflow: 'hidden' }}>
                <img src={n.imageUrl} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            )}

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>{n.title}</Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                {n.pinned && <Chip label="📌 Pinned" color="warning" size="small" />}
                <Chip 
                  label={n.priority} 
                  color={n.priority === 'High' ? 'error' : n.priority === 'Medium' ? 'primary' : 'default'} 
                  size="small" 
                />
                <Chip label={n.category} variant="outlined" size="small" />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {n.description}
              </Typography>

              <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="caption" display="block">
                  👤 Posted by: {n.postedBy}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  📅 {n.timestamp?.toDate ? n.timestamp.toDate().toLocaleDateString() : "N/A"} | 🏷️ {n.role}
                </Typography>
              </Box>

              {canEdit && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => handleEditOpen(n)}>Edit</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(n.id)}>
                    Delete
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Notice</DialogTitle>
        <DialogContent dividers>
          {editNotice && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Title"
                value={editNotice.title}
                onChange={(e) => setEditNotice({ ...editNotice, title: e.target.value })}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={editNotice.description}
                onChange={(e) => setEditNotice({ ...editNotice, description: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editNotice.category || ""}
                  label="Category"
                  onChange={(e) => setEditNotice({ ...editNotice, category: e.target.value as string })}
                >
                  <MenuItem value="Exam">Exam</MenuItem>
                  <MenuItem value="Placement">Placement</MenuItem>
                  <MenuItem value="Cultural">Cultural</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editNotice.priority || ""}
                  label="Priority"
                  onChange={(e) => setEditNotice({ ...editNotice, priority: e.target.value as any })}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button 
                  variant={editNotice.pinned ? "contained" : "outlined"} 
                  color="warning"
                  onClick={() => setEditNotice({ ...editNotice, pinned: !editNotice.pinned })}
                >
                  {editNotice.pinned ? "Pinned" : "Pin Notice"}
                </Button>
                <Button variant="outlined" component="label">
                  Change Image
                  <input hidden type="file" accept="image/*" onChange={(e) => setEditNotice({ ...editNotice, newImage: e.target.files?.[0] })} />
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}