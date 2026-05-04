"use no memo";
import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { Notice } from "@/types";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Bell,
  AlertTriangle,
  Megaphone,
  Calendar,
  Trash2,
  X,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDistanceToNow } from "date-fns";
import type { Timestamp } from "firebase/firestore";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const noticeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  priority: z.enum(["general", "urgent", "event"]),
  targetAudience: z.enum(["all", "department", "course"]),
  department: z.string().optional(),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;

// ─── Priority config ──────────────────────────────────────────────────────────

const priorityConfig = {
  urgent: {
    icon: AlertTriangle,
    label: "Urgent",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
    badgeVariant: "destructive" as const,
  },
  general: {
    icon: Bell,
    label: "General",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    badgeVariant: "secondary" as const,
  },
  event: {
    icon: Calendar,
    label: "Event",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
    badgeVariant: "outline" as const,
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

const NoticeBoard: React.FC = () => {
  const { profile, isAdmin, isHOD, isTeacher } = useAuth();
  const canPost = isAdmin || isHOD || isTeacher;

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<"all" | "general" | "urgent" | "event">("all");

  // ── Real-time listener ──
  useEffect(() => {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    // Students only see notices for their audience
    if (profile?.role === "student" && profile.department) {
      constraints.push(
        where("targetAudience", "in", ["all", "department"])
      );
    }

    const q = query(collection(db, "notices"), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notice));
        setNotices(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
        toast.error("Failed to load notices. Check your connection.");
      }
    );
    return () => unsub();
  }, [profile]);

  // ── Filtered list ──
  const filtered = notices.filter((n) => {
    const matchSearch =
      search === "" ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "all" || n.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time campus notices and announcements
          </p>
        </div>
        {canPost && (
          <Button onClick={() => setShowForm(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Post Notice
          </Button>
        )}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Tabs
          value={filterPriority}
          onValueChange={(v) => setFilterPriority(v as typeof filterPriority)}
        >
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs">🔴 Urgent</TabsTrigger>
            <TabsTrigger value="general" className="text-xs">🔵 General</TabsTrigger>
            <TabsTrigger value="event" className="text-xs">🟢 Event</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-8 w-8" />}
          title={search || filterPriority !== "all" ? "No matching notices" : "No notices yet"}
          description={
            search || filterPriority !== "all"
              ? "Try adjusting your search or filter."
              : canPost
              ? "Be the first to post a notice to the campus."
              : "Check back later for announcements."
          }
          action={
            canPost && !search && filterPriority === "all" ? (
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="mr-1 h-3 w-3" /> Post Notice
              </Button>
            ) : undefined
          }
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((notice, i) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                index={i}
                canDelete={isAdmin || notice.authorId === profile?.uid}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Post Notice Modal */}
      <AnimatePresence>
        {showForm && (
          <NoticeFormModal onClose={() => setShowForm(false)} profile={profile} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Notice Card ─────────────────────────────────────────────────────────────

interface NoticeCardProps {
  notice: Notice;
  index: number;
  canDelete: boolean;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, index, canDelete }) => {
  const config = priorityConfig[notice.priority];
  const Icon = config.icon;

  const handleDelete = async () => {
    if (!confirm("Delete this notice?")) return;
    try {
      await deleteDoc(doc(db, "notices", notice.id!));
      toast.success("Notice deleted.");
    } catch {
      toast.error("Failed to delete notice.");
    }
  };

  const time = notice.createdAt
    ? formatDistanceToNow((notice.createdAt as Timestamp).toDate(), { addSuffix: true })
    : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04 }}
      className={`group rounded-xl border p-5 bg-card transition-shadow hover:shadow-md ${
        notice.priority === "urgent" ? "border-red-500/30" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`rounded-lg border p-2 mt-0.5 ${config.className}`}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="font-semibold leading-snug truncate">{notice.title}</h3>
            <Badge variant={config.badgeVariant} className="text-xs shrink-0">
              {config.label}
            </Badge>
            {notice.targetAudience !== "all" && (
              <Badge variant="outline" className="text-xs shrink-0">
                {notice.department || notice.targetAudience}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {notice.body}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>By {notice.authorName}</span>
            <span>·</span>
            <span>{time}</span>
          </div>
        </div>

        {/* Delete */}
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0"
            onClick={handleDelete}
            aria-label="Delete notice"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Notice Form Modal ────────────────────────────────────────────────────────

interface NoticeFormModalProps {
  onClose: () => void;
  profile: ReturnType<typeof useAuth>["profile"];
}

const NoticeFormModal: React.FC<NoticeFormModalProps> = ({ onClose, profile }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { priority: "general", targetAudience: "all" },
  });

  const targetAudience = useWatch({ control, name: "targetAudience" });

  const onSubmit = useCallback(
    async (data: NoticeFormValues) => {
      if (!profile) return;
      try {
        await addDoc(collection(db, "notices"), {
          ...data,
          authorId: profile.uid,
          authorName: profile.name,
          createdAt: serverTimestamp(),
          attachmentURL: null,
        });
        toast.success("Notice posted successfully!");
        onClose();
      } catch {
        toast.error("Failed to post notice. Try again.");
      }
    },
    [profile, onClose]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-2xl border bg-card shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Post a Notice</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Exam Schedule Released"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <textarea
              id="body"
              rows={4}
              placeholder="Write the full notice content here..."
              {...register("body")}
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            {errors.body && (
              <p className="text-xs text-destructive">{errors.body.message}</p>
            )}
          </div>

          {/* Priority + Audience */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                {...register("priority")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="general">🔵 General</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="event">🟢 Event</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Audience</Label>
              <select
                id="targetAudience"
                {...register("targetAudience")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Everyone</option>
                <option value="department">Department</option>
                <option value="course">Course</option>
              </select>
            </div>
          </div>

          {/* Conditional department field */}
          {targetAudience === "department" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="department">Department Name</Label>
              <Input
                id="department"
                placeholder="e.g. Computer Science"
                {...register("department")}
                defaultValue={profile?.department}
              />
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Posting...</>
              ) : (
                "Post Notice"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NoticeBoard;
