import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  alpha,
  useTheme,
  Button,
} from "@mui/material";
import {
  Send,
  MoreVertical,
  Search,
  User,
  Image as ImageIcon,
  Smile,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  doc,
} from "firebase/firestore";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

interface ChatContact {
  id: string;
  name: string;
  role: string;
  department: string;
}

export default function Chat() {
  const { user } = useAuth();
  const theme = useTheme();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (!selectedContact || !user) return;

    const chatId = [user.id, selectedContact.id].sort().join("_");
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });

    return () => unsubscribe();
  }, [selectedContact, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchContacts = async () => {
    if (!user) return;
    try {
      // If student, fetch teachers. If teacher, fetch students.
      const targetRole = user.role === "STUDENT" ? "TEACHER" : "STUDENT";
      const q = query(
        collection(db, "users"),
        where("role", "==", targetRole),
        where("department", "==", user.department)
      );
      const snapshot = await getDocs(q);
      setContacts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatContact)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || !user) return;

    const chatId = [user.id, selectedContact.id].sort().join("_");
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.id,
        text: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ height: 'calc(100vh - 120px)' }}>
      <Paper sx={{ height: '100%', display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          
          {/* CONTACTS LIST */}
          <Grid item xs={12} md={4} sx={{ borderRight: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>Messages</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search mentors..."
                InputProps={{ startAdornment: <Search size={18} style={{ marginRight: '8px' }} /> }}
              />
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {contacts.map((contact) => (
                <ListItem
                  key={contact.id}
                  component={Button}
                  onClick={() => setSelectedContact(contact)}
                  sx={{ 
                    px: 3, py: 2, 
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    bgcolor: selectedContact?.id === contact.id ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    borderLeft: `4px solid ${selectedContact?.id === contact.id ? theme.palette.primary.main : 'transparent'}`,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      {contact.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography fontWeight={700}>{contact.name}</Typography>}
                    secondary={contact.role}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* CHAT WINDOW */}
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
            {selectedContact ? (
              <>
                {/* HEADER */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>{selectedContact.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{selectedContact.name}</Typography>
                      <Typography variant="caption" color="success.main" fontWeight={600}>Online</Typography>
                    </Box>
                  </Box>
                  <IconButton><MoreVertical size={20} /></IconButton>
                </Box>

                {/* MESSAGES */}
                <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: isMe ? '20px 20px 0 20px' : '20px 20px 20px 0',
                            bgcolor: isMe ? 'primary.main' : 'background.paper',
                            color: isMe ? 'white' : 'text.primary',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Typography variant="body2">{msg.text}</Typography>
                        </Paper>
                        <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.6 }}>
                          {msg.timestamp ? format(msg.timestamp.toDate(), "hh:mm a") : "Just now"}
                        </Typography>
                      </Box>
                    );
                  })}
                  <div ref={scrollRef} />
                </Box>

                {/* INPUT */}
                <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <IconButton size="small"><ImageIcon size={20}/></IconButton>
                    <IconButton size="small"><Smile size={20}/></IconButton>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      variant="outlined"
                      size="small"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px', px: 2 } }}
                    />
                    <IconButton 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                      }}
                    >
                      <Send size={20} />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main }}>
                  <MessageSquare size={40} />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>Your Messages</Typography>
                <Typography color="textSecondary">Select a contact to start chatting</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
