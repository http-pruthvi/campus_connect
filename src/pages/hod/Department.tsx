import React, { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Users, GraduationCap, BookOpen, UserCheck,
  TrendingUp, Calendar, MessageSquare, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import type { UserProfile, CampusEvent, Question, QueryTicket } from "@/types";

const DepartmentPage: React.FC = () => {
  const { profile } = useAuth();
  const dept = profile?.department ?? "";

  const [members, setMembers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tickets, setTickets] = useState<QueryTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dept) { 
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t); 
    }

    const unsubs: (() => void)[] = [];

    // Department members
    unsubs.push(onSnapshot(
      query(collection(db, "users"), where("department", "==", dept), orderBy("name", "asc")),
      (snap) => setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile))),
      () => toast.error("Failed to load members.")
    ));

    // Department events
    unsubs.push(onSnapshot(
      query(collection(db, "events"), orderBy("date", "desc")),
      (snap) => setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CampusEvent))),
    ));

    // Department questions
    unsubs.push(onSnapshot(
      query(collection(db, "questions"), where("department", "==", dept), orderBy("createdAt", "desc")),
      (snap) => setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question))),
    ));

    // Department tickets
    unsubs.push(onSnapshot(
      query(collection(db, "queries"), orderBy("createdAt", "desc")),
      (snap) => {
        setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QueryTicket)));
        setLoading(false);
      },
    ));

    return () => unsubs.forEach((u) => u());
  }, [dept]);

  if (!dept) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8" />}
        title="No department assigned"
        description="Your profile doesn't have a department set. Please contact an admin."
      />
    );
  }

  const students = members.filter((m) => m.role === "student");
  const teachers = members.filter((m) => m.role === "teacher");
  const openTickets = tickets.filter((t) => t.status === "open");
  const openQuestions = questions.filter((q) => q.status === "open");

  const stats = [
    { label: "Total Members", value: members.length, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Students", value: students.length, icon: GraduationCap, color: "text-green-600", bg: "bg-green-500/10" },
    { label: "Faculty", value: teachers.length, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-500/10" },
    { label: "Open Questions", value: openQuestions.length, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Open Tickets", value: openTickets.length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-500/10" },
    { label: "Events", value: events.length, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{dept}</h1>
            <p className="text-sm text-muted-foreground">Department Overview</p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-24 rounded-xl border bg-muted/40 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Members list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Department Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members found.</p>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-3 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Details</span>
            </div>
            {members.map((m, i) => (
              <motion.div
                key={m.uid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr] gap-2 md:gap-4 items-center px-5 py-3 border-b last:border-b-0 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold uppercase">{m.name?.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium truncate">{m.name}</span>
                </div>
                <span className="text-sm text-muted-foreground truncate">{m.email}</span>
                <Badge variant="outline" className="text-xs capitalize w-fit">
                  {m.role}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {m.role === "student" ? `${m.course ?? ""} ${m.year ? `· Year ${m.year}` : ""}` : "Faculty"}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent questions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Department Questions</h2>
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions posted in this department.</p>
        ) : (
          <div className="space-y-2">
            {questions.slice(0, 5).map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-lg border bg-card p-4 flex items-start gap-3"
              >
                <div className={`mt-0.5 p-1.5 rounded-md ${q.status === "answered" ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                  <MessageSquare className={`h-3.5 w-3.5 ${q.status === "answered" ? "text-green-600" : "text-blue-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{q.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>By {q.authorName}</span>
                    <span>· {q.subject}</span>
                    <Badge variant="outline" className={`text-xs ml-auto ${q.status === "answered" ? "bg-green-500/10 text-green-600" : ""}`}>
                      {q.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <TrendingUp className="h-3 w-3" />
                  {q.upvotes?.length ?? 0}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentPage;
