import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box } from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EditNoticeModal({ open, onClose, notice, onUpdated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setDescription(notice.description);
    }
  }, [notice]);

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "notices", notice.id), {
        title,
        description,
      });

      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit Notice</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button variant="contained" onClick={handleUpdate}>
            Update
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}