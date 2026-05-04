import React, { useEffect, useState, useCallback } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, updateDoc,
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
  Plus, Search as SearchIcon, MapPin, X, Loader2,
  Trash2, CheckCircle2, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import type { LostFoundItem } from "@/types";
import type { Timestamp } from "firebase/firestore";

const CATEGORIES = ["Electronics", "Books", "Clothing", "ID/Cards", "Keys", "Bag/Wallet", "Other"];

const STATUS_COLORS: Record<string, string> = {
  lost:     "bg-red-500/10 text-red-600 border-red-500/20",
  found:    "bg-blue-500/10 text-blue-600 border-blue-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
};

const itemSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
});
type ItemFormValues = z.infer<typeof itemSchema>;

const LostFoundPage: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "lost" | "found" | "resolved">("all");

  useEffect(() => {
    const q = query(collection(db, "lostfound"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LostFoundItem)));
      setLoading(false);
    }, () => { setLoading(false); toast.error("Failed to load items."); });
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch = search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || item.status === typeFilter || (typeFilter !== "resolved" && item.type === typeFilter && item.status !== "resolved");
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
          <p className="mt-1 text-sm text-muted-foreground">Report lost items or claim found ones</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Report Item
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span><strong className="text-red-600">{items.filter((i) => i.type === "lost" && i.status !== "resolved").length}</strong> lost</span>
        <span><strong className="text-blue-600">{items.filter((i) => i.type === "found" && i.status !== "resolved").length}</strong> found</span>
        <span><strong className="text-green-600">{items.filter((i) => i.status === "resolved").length}</strong> resolved</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items, locations..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="lost" className="text-xs">🔴 Lost</TabsTrigger>
            <TabsTrigger value="found" className="text-xs">🔵 Found</TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">✅ Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl border bg-muted/40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title={search || typeFilter !== "all" ? "No matching items" : "Nothing reported yet"}
          description="Report a lost or found item to help your campus community."
          action={!search ? <Button size="sm" onClick={() => setShowForm(true)}><Plus className="mr-1 h-3 w-3" /> Report</Button> : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <ItemCard key={item.id} item={item} index={i}
              canManage={isAdmin || item.postedBy === profile?.uid}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && <ItemFormModal onClose={() => setShowForm(false)} profile={profile} />}
      </AnimatePresence>
    </div>
  );
};

// ─── Item Card ────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: LostFoundItem;
  index: number;
  canManage: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, index, canManage }) => {
  const time = item.createdAt
    ? formatDistanceToNow((item.createdAt as Timestamp).toDate(), { addSuffix: true })
    : "";
  const isResolved = item.status === "resolved";

  const handleResolve = async () => {
    if (!item.id) return;
    try {
      await updateDoc(doc(db, "lostfound", item.id), { status: "resolved" });
      toast.success("Item marked as resolved!");
    } catch { toast.error("Failed to update."); }
  };

  const handleDelete = async () => {
    if (!item.id || !confirm("Delete this report?")) return;
    try {
      await deleteDoc(doc(db, "lostfound", item.id));
      toast.success("Report deleted.");
    } catch { toast.error("Failed to delete."); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group rounded-xl border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${isResolved ? "opacity-60" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[item.status]}`}>
              {item.status === "resolved" ? "Resolved" : item.type === "lost" ? "Lost" : "Found"}
            </Badge>
            <Badge variant="secondary" className="text-xs">{item.category}</Badge>
          </div>
          <h3 className="font-semibold text-sm leading-snug">{item.title}</h3>
        </div>
        {canManage && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {!isResolved && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleResolve} title="Mark resolved">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={handleDelete} title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>

      {/* Meta */}
      <div className="mt-auto space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
        <div className="flex justify-between">
          <span>By {item.postedByName}</span>
          <span>{time}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Item Form Modal ──────────────────────────────────────────────────────────

interface ItemFormModalProps {
  onClose: () => void;
  profile: ReturnType<typeof useAuth>["profile"];
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ onClose, profile }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { type: "lost" },
  });

  const onSubmit = useCallback(async (data: ItemFormValues) => {
    if (!profile) return;
    try {
      await addDoc(collection(db, "lostfound"), {
        type: data.type,
        title: data.title,
        category: data.category,
        description: data.description,
        location: data.location,
        date: serverTimestamp(),
        postedBy: profile.uid,
        postedByName: profile.name,
        status: data.type, // "lost" or "found"
        createdAt: serverTimestamp(),
      });
      toast.success("Item reported!");
      onClose();
    } catch { toast.error("Failed to submit report."); }
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
          <h2 className="text-lg font-semibold">Report Item</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="space-y-2">
            <Label>I have...</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["lost", "found"] as const).map((type) => (
                <label key={type}
                  className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors"
                >
                  <input type="radio" value={type} {...register("type")} className="accent-primary" />
                  <span className="text-sm font-medium capitalize">
                    {type === "lost" ? "🔴 Lost an item" : "🔵 Found an item"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lf-title">Item Name *</Label>
            <Input id="lf-title" placeholder="e.g. Blue backpack" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lf-cat">Category *</Label>
              <select id="lf-cat" {...register("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lf-loc">Location *</Label>
              <Input id="lf-loc" placeholder="e.g. Library 2nd floor" {...register("location")} />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lf-desc">Description *</Label>
            <textarea id="lf-desc" rows={3} placeholder="Describe the item, distinguishing features..." {...register("description")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Report"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LostFoundPage;
