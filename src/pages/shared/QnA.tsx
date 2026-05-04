import React, { useEffect, useState, useCallback } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, updateDoc, arrayUnion, arrayRemove,
  getDocs,
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
  Plus, MessageSquare, ThumbsUp, CheckCircle2, X, Loader2,
  Search, ChevronDown, ChevronUp, Send, Trash2, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/Skeletons";
import type { Question, Answer } from "@/types";
import type { Timestamp } from "firebase/firestore";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const questionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  body: z.string().min(20, "Body must be at least 20 characters"),
  subject: z.string().min(1, "Subject is required"),
  department: z.string().min(1, "Department is required"),
  tags: z.string().optional(),
});
type QuestionFormValues = z.infer<typeof questionSchema>;

const answerSchema = z.object({
  body: z.string().min(5, "Answer must be at least 5 characters"),
});
type AnswerFormValues = z.infer<typeof answerSchema>;

// ─── Main Page ────────────────────────────────────────────────────────────────

const QnAPage: React.FC = () => {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "answered">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question)));
      setLoading(false);
    }, () => { setLoading(false); toast.error("Failed to load Q&A."); });
  }, []);

  const filtered = questions.filter((q) => {
    const matchSearch = search === "" ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase()) ||
      q.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "all" || q.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Q&A Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ask questions, share knowledge</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ask Question
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search questions, subjects, tags..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="open" className="text-xs">🔵 Open</TabsTrigger>
            <TabsTrigger value="answered" className="text-xs">✅ Answered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{questions.length}</strong> total</span>
        <span><strong className="text-green-600">{questions.filter(q => q.status === "answered").length}</strong> answered</span>
        <span><strong className="text-blue-600">{questions.filter(q => q.status === "open").length}</strong> open</span>
      </div>

      {/* Questions */}
      {loading ? (
        <ListSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title={search || filter !== "all" ? "No matching questions" : "No questions yet"}
          description={search ? "Try different keywords." : "Be the first to ask a question."}
          action={!search && filter === "all" ? (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-3 w-3" /> Ask a Question
            </Button>
          ) : undefined}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                isExpanded={expandedId === q.id}
                onToggle={() => setExpandedId(expandedId === q.id ? null : q.id!)}
                profile={profile}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Post Question Modal */}
      <AnimatePresence>
        {showForm && <QuestionFormModal onClose={() => setShowForm(false)} profile={profile} />}
      </AnimatePresence>
    </div>
  );
};

// ─── Question Card ────────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: Question;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  profile: ReturnType<typeof useAuth>["profile"];
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question, index, isExpanded, onToggle, profile,
}) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const { isAdmin, isHOD, isTeacher } = useAuth();
  const canDelete = isAdmin || question.authorId === profile?.uid;
  const canMarkAnswered = isAdmin || isHOD || isTeacher;
  const hasUpvoted = question.upvotes?.includes(profile?.uid ?? "");

  // Load answers when expanded
  useEffect(() => {
    if (!isExpanded || !question.id) return;
    const t = setTimeout(() => setLoadingAnswers(true), 0);
    const q = query(collection(db, "questions", question.id, "answers"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Answer));
      setAnswers(data);
      setAnswerCount(data.length);
      setLoadingAnswers(false);
    });
    return () => { clearTimeout(t); unsub(); };
  }, [isExpanded, question.id]);

  // Pre-fetch answer count without expansion
  useEffect(() => {
    if (!question.id || isExpanded) return;
    getDocs(collection(db, "questions", question.id, "answers"))
      .then((snap) => setAnswerCount(snap.size));
  }, [question.id, isExpanded]);

  const handleUpvote = async () => {
    if (!profile?.uid || !question.id) return;
    const ref = doc(db, "questions", question.id);
    try {
      await updateDoc(ref, {
        upvotes: hasUpvoted ? arrayRemove(profile.uid) : arrayUnion(profile.uid),
      });
    } catch { toast.error("Failed to update vote."); }
  };

  const handleDelete = async () => {
    if (!question.id || !confirm("Delete this question and all its answers?")) return;
    try {
      await deleteDoc(doc(db, "questions", question.id));
      toast.success("Question deleted.");
    } catch { toast.error("Failed to delete."); }
  };

  const handleMarkAnswered = async () => {
    if (!question.id) return;
    try {
      await updateDoc(doc(db, "questions", question.id), {
        status: question.status === "answered" ? "open" : "answered",
      });
    } catch { toast.error("Failed to update status."); }
  };

  const time = question.createdAt
    ? formatDistanceToNow((question.createdAt as Timestamp).toDate(), { addSuffix: true })
    : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl border bg-card overflow-hidden"
    >
      {/* Question header */}
      <div
        className="p-5 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-4">
          {/* Upvote */}
          <button
            onClick={(e) => { e.stopPropagation(); handleUpvote(); }}
            className={`flex flex-col items-center gap-0.5 rounded-lg p-2 min-w-[44px] transition-colors ${
              hasUpvoted ? "bg-blue-500/10 text-blue-600" : "hover:bg-muted"
            }`}
            aria-label="Upvote"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs font-medium">{question.upvotes?.length ?? 0}</span>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="font-semibold leading-snug">{question.title}</h3>
              <Badge
                variant={question.status === "answered" ? "default" : "secondary"}
                className={`text-xs shrink-0 ${question.status === "answered" ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}`}
              >
                {question.status === "answered" ? <><CheckCircle2 className="mr-1 h-3 w-3" />Answered</> : "Open"}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{question.body}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              {/* Subject badge */}
              <Badge variant="outline" className="text-xs">{question.subject}</Badge>

              {/* Tags */}
              {question.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Tag className="h-2.5 w-2.5" />{tag}
                </span>
              ))}

              <span className="text-xs text-muted-foreground ml-auto">
                By {question.authorName} · {time}
              </span>
              <span className="text-xs text-muted-foreground">
                💬 {answerCount} {answerCount === 1 ? "answer" : "answers"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {canMarkAnswered && (
              <Button size="icon" variant="ghost" className="h-7 w-7"
                onClick={handleMarkAnswered}
                title={question.status === "answered" ? "Mark as Open" : "Mark as Answered"}
              >
                <CheckCircle2 className={`h-4 w-4 ${question.status === "answered" ? "text-green-500" : ""}`} />
              </Button>
            )}
            {canDelete && (
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive"
                onClick={handleDelete} aria-label="Delete question"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {/* Answers panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t bg-muted/20"
          >
            <div className="p-5 space-y-4">
              {/* Answers list */}
              {loadingAnswers ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : answers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No answers yet — be the first to respond!
                </p>
              ) : (
                <div className="space-y-3">
                  {answers.map((ans, i) => (
                    <AnswerItem key={ans.id} answer={ans} index={i} questionId={question.id!} profile={profile} />
                  ))}
                </div>
              )}

              {/* Answer form */}
              <AnswerForm questionId={question.id!} profile={profile} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Answer Item ──────────────────────────────────────────────────────────────

interface AnswerItemProps {
  answer: Answer;
  index: number;
  questionId: string;
  profile: ReturnType<typeof useAuth>["profile"];
}

const AnswerItem: React.FC<AnswerItemProps> = ({ answer, index, questionId, profile }) => {
  const { isAdmin } = useAuth();
  const canDelete = isAdmin || answer.authorId === profile?.uid;

  const handleDelete = async () => {
    if (!answer.id || !confirm("Delete this answer?")) return;
    try {
      await deleteDoc(doc(db, "questions", questionId, "answers", answer.id));
    } catch { toast.error("Failed to delete answer."); }
  };

  const time = answer.createdAt
    ? formatDistanceToNow((answer.createdAt as Timestamp).toDate(), { addSuffix: true })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex gap-3 rounded-lg border bg-card p-4"
    >
      <div className="h-7 w-7 rounded-full bg-primary/10 border flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold uppercase">{answer.authorName?.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium">{answer.authorName}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{answer.body}</p>
      </div>
      {canDelete && (
        <Button size="icon" variant="ghost"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0 self-start mt-0.5"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </motion.div>
  );
};

// ─── Answer Form ──────────────────────────────────────────────────────────────

interface AnswerFormProps {
  questionId: string;
  profile: ReturnType<typeof useAuth>["profile"];
}

const AnswerForm: React.FC<AnswerFormProps> = ({ questionId, profile }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
  });

  const onSubmit = useCallback(async (data: AnswerFormValues) => {
    if (!profile) return;
    try {
      await addDoc(collection(db, "questions", questionId, "answers"), {
        body: data.body,
        authorId: profile.uid,
        authorName: profile.name,
        createdAt: serverTimestamp(),
        helpful: false,
      });
      reset();
      toast.success("Answer posted!");
    } catch { toast.error("Failed to post answer."); }
  }, [profile, questionId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <Input
        placeholder="Write your answer..."
        {...register("body")}
        className="flex-1 h-10"
      />
      <Button type="submit" size="sm" disabled={isSubmitting} className="shrink-0">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
};

// ─── Question Form Modal ──────────────────────────────────────────────────────

interface QuestionFormModalProps {
  onClose: () => void;
  profile: ReturnType<typeof useAuth>["profile"];
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({ onClose, profile }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: { department: profile?.department ?? "" },
  });

  const onSubmit = useCallback(async (data: QuestionFormValues) => {
    if (!profile) return;
    try {
      const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      await addDoc(collection(db, "questions"), {
        title: data.title,
        body: data.body,
        subject: data.subject,
        department: data.department,
        tags,
        authorId: profile.uid,
        authorName: profile.name,
        upvotes: [],
        status: "open",
        createdAt: serverTimestamp(),
      });
      toast.success("Question posted!");
      onClose();
    } catch { toast.error("Failed to post question."); }
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
          <h2 className="text-lg font-semibold">Ask a Question</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q-title">Question Title *</Label>
            <Input id="q-title" placeholder="e.g. How do I apply for a re-exam?" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-body">Describe your question *</Label>
            <textarea id="q-body" rows={4} placeholder="Provide more context..." {...register("body")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="q-subject">Subject *</Label>
              <Input id="q-subject" placeholder="e.g. Mathematics" {...register("subject")} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-dept">Department *</Label>
              <Input id="q-dept" placeholder="e.g. Computer Science" {...register("department")} />
              {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-tags">Tags <span className="text-muted-foreground text-xs">(comma separated)</span></Label>
            <Input id="q-tags" placeholder="e.g. exam, fees, hostel" {...register("tags")} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Posting...</> : "Post Question"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default QnAPage;
