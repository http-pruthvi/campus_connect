import React, { useEffect, useState, useCallback } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, updateDoc, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Plus, Ticket, X, Loader2, Search,
  Clock, CheckCircle2, AlertCircle, ChevronDown, Send, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/Skeletons";
import type { QueryTicket, QueryReply } from "@/types";
import type { Timestamp } from "firebase/firestore";

const STATUS_MAP = {
  open:          { label: "Open",        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",   icon: AlertCircle },
  "in-progress": { label: "In Progress", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  resolved:      { label: "Resolved",    color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
} as const;

const CATEGORIES = [
  { value: "fee", label: "💰 Fee Related" },
  { value: "academic", label: "📚 Academic" },
  { value: "hostel", label: "🏠 Hostel" },
  { value: "other", label: "📝 Other" },
] as const;

const querySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(15, "Description must be at least 15 characters"),
  category: z.enum(["fee", "academic", "hostel", "other"]),
});
type QueryFormValues = z.infer<typeof querySchema>;

const replySchema = z.object({
  body: z.string().min(3, "Reply must be at least 3 characters"),
});
type ReplyFormValues = z.infer<typeof replySchema>;

// ─── Main Component ───────────────────────────────────────────────────────────

const QueriesPage: React.FC = () => {
  const { profile, isAdmin, isHOD, isTeacher } = useAuth();
  const isStaff = isAdmin || isHOD || isTeacher;

  const [tickets, setTickets] = useState<QueryTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in-progress" | "resolved">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Students see only their own tickets; staff see all
    const col = collection(db, "queries");
    const q = isStaff
      ? query(col, orderBy("createdAt", "desc"))
      : profile?.uid
        ? query(col, where("studentId", "==", profile.uid), orderBy("createdAt", "desc"))
        : null;

    if (!q) return;
    return onSnapshot(q, (snap) => {
      setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QueryTicket)));
      setLoading(false);
    }, () => { setLoading(false); toast.error("Failed to load tickets."); });
  }, [isStaff, profile?.uid]);

  const filtered = tickets.filter((t) => {
    const matchSearch = search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.studentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isStaff ? "Support Tickets" : "My Queries"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isStaff ? "Manage student support requests" : "Raise and track your campus queries"}
          </p>
        </div>
        {!isStaff && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Query
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{tickets.length}</strong> total</span>
        <span><strong className="text-blue-600">{tickets.filter((t) => t.status === "open").length}</strong> open</span>
        <span><strong className="text-amber-600">{tickets.filter((t) => t.status === "in-progress").length}</strong> in progress</span>
        <span><strong className="text-green-600">{tickets.filter((t) => t.status === "resolved").length}</strong> resolved</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="open" className="text-xs">Open</TabsTrigger>
            <TabsTrigger value="in-progress" className="text-xs">In Progress</TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tickets list */}
      {loading ? (
        <ListSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-8 w-8" />}
          title={search || statusFilter !== "all" ? "No matching tickets" : "No queries yet"}
          description={isStaff ? "No support requests to show." : "Submit a query to get help from your campus staff."}
          action={!isStaff && !search ? (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-3 w-3" /> Submit Query
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              index={i}
              isStaff={isStaff}
              isExpanded={expandedId === ticket.id}
              onToggle={() => setExpandedId(expandedId === ticket.id ? null : ticket.id!)}
              profile={profile}
            />
          ))}
        </div>
      )}

      {/* New Query Modal */}
      <AnimatePresence>
        {showForm && <QueryFormModal onClose={() => setShowForm(false)} profile={profile} />}
      </AnimatePresence>
    </div>
  );
};

// ─── Ticket Card ──────────────────────────────────────────────────────────────

interface TicketCardProps {
  ticket: QueryTicket;
  index: number;
  isStaff: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  profile: ReturnType<typeof useAuth>["profile"];
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, index, isStaff, isExpanded, onToggle, profile }) => {
  const [replies, setReplies] = useState<QueryReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { isAdmin } = useAuth();

  const statusInfo = STATUS_MAP[ticket.status];
  const StatusIcon = statusInfo.icon;
  const canDelete = isAdmin || ticket.studentId === profile?.uid;

  const time = ticket.createdAt
    ? formatDistanceToNow((ticket.createdAt as Timestamp).toDate(), { addSuffix: true })
    : "";

  const catLabel = CATEGORIES.find((c) => c.value === ticket.category)?.label ?? ticket.category;

  useEffect(() => {
    if (!isExpanded || !ticket.id) return;
    const t = setTimeout(() => setLoadingReplies(true), 0);
    const q = query(collection(db, "queries", ticket.id, "replies"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setReplies(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QueryReply)));
      setLoadingReplies(false);
    });
    return () => { clearTimeout(t); unsub(); };
  }, [isExpanded, ticket.id]);

  const handleStatusChange = async (newStatus: QueryTicket["status"]) => {
    if (!ticket.id) return;
    try {
      await updateDoc(doc(db, "queries", ticket.id), { status: newStatus });
      toast.success(`Ticket marked as ${newStatus}.`);
    } catch { toast.error("Failed to update status."); }
  };

  const handleDelete = async () => {
    if (!ticket.id || !confirm("Delete this ticket?")) return;
    try {
      await deleteDoc(doc(db, "queries", ticket.id));
      toast.success("Ticket deleted.");
    } catch { toast.error("Failed to delete."); }
  };

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="rounded-xl border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 cursor-pointer hover:bg-accent/20 transition-colors" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 p-1.5 rounded-lg ${statusInfo.color}`}>
            <StatusIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{ticket.title}</h3>
              <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                {statusInfo.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">{catLabel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {isStaff && <span>By <strong>{ticket.studentName}</strong></span>}
              <span>{time}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {isStaff && ticket.status !== "resolved" && (
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as QueryTicket["status"])}
                className="h-7 rounded-md border bg-background px-2 text-xs focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            )}
            {canDelete && (
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      {/* Replies panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t bg-muted/20"
          >
            <div className="p-5 space-y-4">
              {loadingReplies ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : replies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No replies yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {replies.map((reply, i) => {
                    const replyTime = reply.createdAt
                      ? formatDistanceToNow((reply.createdAt as Timestamp).toDate(), { addSuffix: true })
                      : "";
                    const isStaffReply = reply.authorId !== ticket.studentId;
                    return (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: isStaffReply ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`rounded-lg border p-3 ${isStaffReply ? "bg-primary/5 ml-6" : "bg-card mr-6"}`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-medium">{reply.authorName}</span>
                          {isStaffReply && <Badge variant="outline" className="text-xs py-0">Staff</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">{replyTime}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{reply.body}</p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              <ReplyForm ticketId={ticket.id!} profile={profile} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Reply Form ───────────────────────────────────────────────────────────────

interface ReplyFormProps {
  ticketId: string;
  profile: ReturnType<typeof useAuth>["profile"];
}

const ReplyForm: React.FC<ReplyFormProps> = ({ ticketId, profile }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
  });

  const onSubmit = useCallback(async (data: ReplyFormValues) => {
    if (!profile) return;
    try {
      await addDoc(collection(db, "queries", ticketId, "replies"), {
        body: data.body,
        authorId: profile.uid,
        authorName: profile.name,
        createdAt: serverTimestamp(),
      });
      reset();
      toast.success("Reply posted!");
    } catch { toast.error("Failed to post reply."); }
  }, [profile, ticketId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <Input placeholder="Write a reply..." {...register("body")} className="flex-1 h-10" />
      <Button type="submit" size="sm" disabled={isSubmitting} className="shrink-0">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
};

// ─── Query Form Modal ─────────────────────────────────────────────────────────

interface QueryFormModalProps {
  onClose: () => void;
  profile: ReturnType<typeof useAuth>["profile"];
}

const QueryFormModal: React.FC<QueryFormModalProps> = ({ onClose, profile }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
  });

  const onSubmit = useCallback(async (data: QueryFormValues) => {
    if (!profile) return;
    try {
      await addDoc(collection(db, "queries"), {
        title: data.title,
        category: data.category,
        description: data.description,
        studentId: profile.uid,
        studentName: profile.name,
        status: "open",
        createdAt: serverTimestamp(),
      });
      toast.success("Query submitted!");
      onClose();
    } catch { toast.error("Failed to submit query."); }
  }, [profile, onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-2xl border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Submit a Query</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qt-title">Title *</Label>
            <Input id="qt-title" placeholder="e.g. Fee receipt not generated" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qt-cat">Category *</Label>
            <select id="qt-cat" {...register("category")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qt-desc">Description *</Label>
            <textarea id="qt-desc" rows={4} placeholder="Describe your issue in detail..." {...register("description")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Query"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default QueriesPage;
