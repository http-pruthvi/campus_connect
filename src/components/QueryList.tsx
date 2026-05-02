import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import QueryCard from "./QueryCard";
import { Box, CircularProgress, Typography, alpha, useTheme } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

interface QueryData {
  id: string;
  title: string;
  description: string;
  category: string;
  postedBy: string;
  date_posted: any;
  status: string;
}

export default function QueryList() {
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const q = query(collection(db, "queries"), orderBy("date_posted", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as QueryData[];
        setQueries(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching queries:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleNotify = (notif: { type: string; message: string }) => {
    console.log("Notification:", notif);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {queries.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 4, border: '2px dashed', borderColor: 'divider' }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography color="textSecondary">No queries found. Post one to start a discussion!</Typography>
        </Box>
      ) : (
        queries.map((q) => (
          <QueryCard key={q.id} query={q} onNotify={handleNotify} />
        ))
      )}
    </Box>
  );
}
