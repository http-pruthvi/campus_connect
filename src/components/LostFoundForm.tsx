import { useState } from "react";
import { TextField, Button, MenuItem, Box } from "@mui/material";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../styles/LostFound.css";

const statuses = ["lost", "found"];

export default function LostFoundForm({ userData, onAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("lost");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image!");

    try {
      // Upload image
      const storageRef = ref(storage, `lostFound/${file.name}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const imageURL = await getDownloadURL(storageRef);

      
      await addDoc(collection(db, "lostFoundItems"), {
        title,
        description,
        status,
        imageURL,
        postedBy: userData.uid,
        role: userData.role,
        department: userData.department || "",
        year: userData.year || "",
        date: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setFile(null);
      setStatus("lost");
      if (onAdded) onAdded();
    } catch (err) {
      console.error("Error posting item:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required sx={{ mb: 2 }} />
      <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={3} required sx={{ mb: 2 }} />
      <TextField select label="Status" value={status} onChange={e => setStatus(e.target.value)} sx={{ mb: 2, width: 200 }}>
        {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ marginBottom: "10px" }} />
      <Button variant="contained" type="submit">Post Item</Button>
    </Box>
  );
}
