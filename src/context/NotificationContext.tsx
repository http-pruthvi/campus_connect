import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "NOTICE" | "ASSIGNMENT" | "QUERY" | "SYSTEM";
  read: boolean;
  timestamp: any;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, "users", user.id, "notifications"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.id, "notifications", id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      if (!n.read) {
        batch.update(doc(db, "users", user.id, "notifications", n.id), { read: true });
      }
    });
    await batch.commit();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
