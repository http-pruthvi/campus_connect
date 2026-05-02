import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  TextField,
  Button,
  MenuItem,
  Box,
  Paper,
  Typography,
  LinearProgress,
  Snackbar,
  FormControl,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";
import "../styles/NoticeBoard.css";
import classifyNotice from "../utils/classifyNotice";
import { uploadImageToImgBB } from "../utils/imageUpload";

const categories = ["Exam", "Placement", "Cultural", "Other"];

const departments = [
  "All",
  "Computer Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
];

const years = ["All", "1st", "2nd", "3rd", "4th"];

export default function NoticeForm({ onAdded }) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");
  const [autoCategory, setAutoCategory] = useState("");

  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);

  const [openSnack, setOpenSnack] = useState(false);

  // ✅ NEW PIN STATE
  const [isPinned, setIsPinned] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    role: "",
    department: "",
  });

  // 🔍 Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          let userSnap;

          if (user.uid) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              userSnap = docSnap.data();
            }
          }

          if (!userSnap && user.email) {
            const q = query(
              collection(db, "users"),
              where("email", "==", user.email)
            );
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              userSnap = querySnap.docs[0].data();
            }
          }

          if (userSnap) {
            setUserData(userSnap);
          } else {
            setUserData({
              name: user.displayName || user.email.split("@")[0],
              role: "User",
              department: "Unknown",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // 🤖 AUTO CATEGORY DETECTION
  useEffect(() => {
    if (title || description) {
      const detected = classifyNotice(title + " " + description);
      setAutoCategory(detected);
    }
  }, [title, description]);

  // 🚀 Submit Notice
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        setUploading(true);
        imageUrl = await uploadImageToImgBB(image);
        setUploading(false);
      }

      await addDoc(collection(db, "notices"), {
        title,
        description,
        category: category || autoCategory,
        department,
        year,
        imageUrl,

        postedBy:
          userData.name ||
          user.displayName ||
          user.email.split("@")[0],

        role: userData.role || "User",
        postedByDepartment: userData.department || "Unknown",

        // ✅ PIN ADDED
        pinned: isPinned,

        timestamp: serverTimestamp(),
      });

      // reset
      setTitle("");
      setDescription("");
      setCategory("");
      setAutoCategory("");
      setDepartment("All");
      setYear("All");
      setImage(null);
      setIsPinned(false); // ✅ RESET PIN

      setOpenSnack(true);
      if (onAdded) onAdded();
    } catch (err) {
      console.error("Error adding notice:", err);
    }

    setLoading(false);
  };

  return (
    <Paper
      elevation={5}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 3,
        maxWidth: 700,
        margin: "2rem auto",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}
      >
        Post New Notice
      </Typography>

      {/* 🤖 AI Suggestion */}
      {autoCategory && (
        <Typography sx={{ color: "gray", mb: 2 }}>
          🤖 AI Suggests: <strong>{autoCategory}</strong>
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        
        <TextField
          label="Title"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          required
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Category */}
        <FormControl fullWidth>
          <TextField
            select
            label="Category (AI Suggested)"
            value={category || autoCategory}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[autoCategory, ...categories]
              .filter((v, i, arr) => v && arr.indexOf(v) === i)
              .map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === autoCategory
                    ? `🤖 ${cat} (Suggested)`
                    : cat}
                </MenuItem>
              ))}
          </TextField>
        </FormControl>

        {/* Department */}
        <TextField
          select
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          {departments.map((dep) => (
            <MenuItem key={dep} value={dep}>
              {dep}
            </MenuItem>
          ))}
        </TextField>

        {/* Year */}
        <TextField
          select
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        {/* ✅ PIN BUTTON */}
        <Button
          variant={isPinned ? "contained" : "outlined"}
          color="warning"
          onClick={() => setIsPinned(!isPinned)}
        >
          {isPinned ? "📌 Pinned" : "Pin Notice"}
        </Button>

        {/* Image Upload */}
        <div className="upload-section">
          <Button variant="outlined" component="label">
            {image ? "Change Image" : "Upload Image"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Button>

          {image && <p>{image.name}</p>}
        </div>

        {uploading && <LinearProgress />}

        <Button
          variant="contained"
          type="submit"
          disabled={loading || uploading}
        >
          {loading ? "Posting..." : "Post Notice"}
        </Button>
      </Box>

      <Snackbar
        open={openSnack}
        autoHideDuration={3000}
        onClose={() => setOpenSnack(false)}
        message="✅ Notice posted successfully!"
      />
    </Paper>
  );
}