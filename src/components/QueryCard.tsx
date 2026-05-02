import React, { useEffect, useState } from "react";
import { doc, collection, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AnswerSection from "./AnswerSection";
import { 
  Paper, Box, Typography, Chip, Button, Divider, 
  Avatar, alpha, useTheme, IconButton, Tooltip 
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface Reply {
  id: string;
  repliedBy: string;
  text: string;
  time: any;
}

interface QueryCardProps {
  query: {
    id: string;
    title: string;
    description: string;
    category: string;
    postedBy: string;
    date_posted: any;
    status: string;
  };
  onNotify?: (notif: { type: string; message: string }) => void;
}

export default function QueryCard({ query: queryData, onNotify }: QueryCardProps) {
  const theme = useTheme();
  
  if (!queryData || !queryData.id) return null;

  const { id, title, description, category, postedBy, date_posted, status } = queryData;
  const [replies, setReplies] = useState<Reply[]>([]);
  const [localStatus, setLocalStatus] = useState(status || "open");

  useEffect(() => {
    const repliesRef = query(collection(db, `queries/${id}/replies`), orderBy("time", "asc"));
    const unsub = onSnapshot(
      repliesRef,
      (snapshot) => {
        const docs: Reply[] = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            if (onNotify)
              onNotify({ type: "reply", message: `New reply on: ${title}` });
          }
        });
        snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() } as Reply));
        setReplies(docs);
      },
      (err) => {
        console.error("Replies listener error:", err);
      }
    );

    return () => unsub();
  }, [id, onNotify, title]);

  const toggleResolved = async () => {
    try {
      const docRef = doc(db, "queries", id);
      const newStatus = localStatus === "open" ? "resolved" : "open";
      await updateDoc(docRef, { status: newStatus });
      setLocalStatus(newStatus);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const formatDate = (date: any) => {
    if (!date?.seconds) return "";
    return new Date(date.seconds * 1000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.01)
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: 'text.primary' }}>
            {title || "Untitled Query"}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip 
              label={localStatus.toUpperCase()} 
              size="small" 
              color={localStatus === "resolved" ? "success" : "warning"}
              sx={{ fontWeight: 800, fontSize: '0.65rem' }}
            />
            <Chip 
              label={category || "General"} 
              size="small" 
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.65rem' }}
            />
          </Box>
        </Box>
        <Tooltip title={localStatus === "open" ? "Mark as Resolved" : "Reopen Query"}>
          <IconButton onClick={toggleResolved} color={localStatus === "resolved" ? "success" : "default"}>
            {localStatus === "resolved" ? <CheckCircleOutlineIcon /> : <RadioButtonUncheckedIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Meta */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, color: 'text.secondary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Avatar sx={{ width: 20, height: 20, bgcolor: 'primary.main', fontSize: '0.6rem' }}>
            {postedBy?.charAt(0) || <PersonIcon sx={{ fontSize: 14 }} />}
          </Avatar>
          <Typography variant="caption" fontWeight={700}>{postedBy || "Anonymous"}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption">{formatDate(date_posted)}</Typography>
        </Box>
      </Box>

      {/* Description */}
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
        {description || "No description provided."}
      </Typography>

      <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

      {/* Replies */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} /> {replies.length} Replies
        </Typography>
        
        {replies.length === 0 ? (
          <Typography variant="body2" color="textDisabled" sx={{ fontStyle: 'italic', pl: 1 }}>
            No replies yet — be the first to reply.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {replies.map((r) => (
              <Box key={r.id} sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={800} color="primary">
                    {r.repliedBy || "Anonymous"}
                  </Typography>
                  <Typography variant="caption" color="textDisabled">
                    {formatDate(r.time)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{r.text}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Reply Form */}
      <Box sx={{ mt: 2 }}>
        <AnswerSection queryId={id} />
      </Box>
    </Paper>
  );
}
