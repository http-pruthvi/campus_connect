import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  Alert,
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

import NoticeForm from "../components/NoticeForm";
import "../styles/NoticeBoard.css";
import { uploadImageToImgBB } from "../utils/imageUpload";

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // EDIT STATE
  const [editOpen, setEditOpen] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const role = user?.role?.trim().toUpperCase();
  const canEdit = ["ADMIN", "HOD", "TEACHER"].includes(role);

  // 🔥 FETCH
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);

      let data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      data = data.map((n) => ({
        id: n.id,
        title: n.title || "",
        description: n.description || "",
        category: n.category || "General",
        priority: n.priority || "Low",
        pinned: n.pinned || false,
        department: n.department || "All",
        year: n.year || "All",
        postedBy: n.postedBy || "Unknown",
        role: n.role || "User",
        imageUrl: n.imageUrl || "",
        timestamp: n.timestamp,
      }));

      const priorityOrder = { High: 3, Medium: 2, Low: 1 };

      data.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      setNotices(data);
      setFilteredNotices(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 🔍 FILTER
  useEffect(() => {
    let filtered = [...notices];

    if (selectedDept !== "All") {
      filtered = filtered.filter((n) => n.department === selectedDept);
    }
    if (selectedYear !== "All") {
      filtered = filtered.filter((n) => n.year === selectedYear);
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter((n) => n.category === selectedCategory);
    }

    setFilteredNotices(filtered);
  }, [selectedDept, selectedYear, selectedCategory, notices]);

  // 🗑 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    await deleteDoc(doc(db, "notices", id));
    fetchNotices();
  };

  // ✏️ OPEN EDIT
  const handleEditOpen = (n) => {
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

  // 💾 SAVE EDIT
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
      fetchNotices();
    } catch (err) {
      console.error(err);
    }

    setSaving(false);
  };

  if (loading)
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        📢 Notice Board
      </Typography>

      {canEdit && <NoticeForm onAdded={fetchNotices} />}

      {/* FILTERS */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl>
          <InputLabel>Department</InputLabel>
          <Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Computer Engineering">Computer</MenuItem>
            <MenuItem value="Electrical Engineering">Electrical</MenuItem>
            <MenuItem value="Mechanical Engineering">Mechanical</MenuItem>
            <MenuItem value="Civil Engineering">Civil</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Year</InputLabel>
          <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="1st">1st</MenuItem>
            <MenuItem value="2nd">2nd</MenuItem>
            <MenuItem value="3rd">3rd</MenuItem>
            <MenuItem value="4th">4th</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* NOTICES */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 2 }}>
        {filteredNotices.map((n) => (
          <Card key={n.id}>
            {n.imageUrl && (
              <img src={n.imageUrl} style={{ width: "100%", maxHeight: 180 }} />
            )}

            <CardContent>
              <Typography variant="h6">{n.title}</Typography>

              <Box sx={{ display: "flex", gap: 1, my: 1 }}>
                {n.pinned && <Chip label="📌 Pinned" color="warning" size="small" />}
                <Chip label={n.priority} size="small" />
                <Chip label={n.category} size="small" />
              </Box>

              <Typography>{n.description}</Typography>

              <Typography variant="caption">
                👤 {n.postedBy} ({n.role})
              </Typography>

              {canEdit && (
                <Box sx={{ mt: 2 }}>
                  <Button onClick={() => handleEditOpen(n)}>Edit</Button>
                  <Button color="error" onClick={() => handleDelete(n.id)}>
                    Delete
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 🔥 EDIT MODAL */}
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth>
        <DialogTitle>Edit Notice</DialogTitle>

        <DialogContent>
          {editNotice && (
            <>
              <TextField
                fullWidth
                label="Title"
                margin="normal"
                value={editNotice.title}
                onChange={(e) =>
                  setEditNotice({ ...editNotice, title: e.target.value })
                }
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                margin="normal"
                value={editNotice.description}
                onChange={(e) =>
                  setEditNotice({ ...editNotice, description: e.target.value })
                }
              />

              <TextField
                select
                fullWidth
                label="Category"
                margin="normal"
                value={editNotice.category}
                onChange={(e) =>
                  setEditNotice({ ...editNotice, category: e.target.value })
                }
              >
                <MenuItem value="Exam">Exam</MenuItem>
                <MenuItem value="Placement">Placement</MenuItem>
                <MenuItem value="Cultural">Cultural</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Priority"
                margin="normal"
                value={editNotice.priority}
                onChange={(e) =>
                  setEditNotice({ ...editNotice, priority: e.target.value })
                }
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </TextField>

              <Button
                onClick={() =>
                  setEditNotice({
                    ...editNotice,
                    pinned: !editNotice.pinned,
                  })
                }
              >
                {editNotice.pinned ? "Unpin" : "Pin"}
              </Button>

              <Button component="label">
                Change Image
                <input
                  hidden
                  type="file"
                  onChange={(e) =>
                    setEditNotice({
                      ...editNotice,
                      newImage: e.target.files[0],
                    })
                  }
                />
              </Button>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleSaveEdit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}