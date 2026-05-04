import React, { useEffect, useState, useRef } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, writeBatch, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import type { Timestamp } from "firebase/firestore";

interface Notification {
  id: string;
  type: "notice" | "event" | "query" | "qna" | "system";
  message: string;
  link: string;
  read: boolean;
  createdAt: Timestamp;
}

const TYPE_ICONS: Record<string, string> = {
  notice: "📢",
  event: "🎉",
  query: "🎫",
  qna: "💬",
  system: "⚙️",
};

export const NotificationBell: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Real-time listener
  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(
      collection(db, "users", profile.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(20),
    );
    return onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
    });
  }, [profile?.uid]);

  const unread = notifications.filter((n) => !n.read).length;

  const handleClick = async (n: Notification) => {
    // Mark as read
    if (!n.read && profile?.uid) {
      await updateDoc(doc(db, "users", profile.uid, "notifications", n.id), { read: true });
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    if (!profile?.uid || unread === 0) return;
    const batch = writeBatch(db);
    notifications.filter((n) => !n.read).forEach((n) => {
      batch.update(doc(db, "users", profile.uid, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const time = n.createdAt
                    ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true })
                    : "";
                  return (
                    <motion.button
                      key={n.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-accent/40 transition-colors border-b last:border-b-0 ${
                        !n.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.read ? "font-medium" : "text-muted-foreground"}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
                      </div>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
