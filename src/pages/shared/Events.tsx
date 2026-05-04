import React, { useEffect, useState, useCallback } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, runTransaction, getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import QRCode from "qrcode";
import {
  Plus, Calendar, MapPin, Users, Clock, X, Loader2,
  Download, QrCode, Trash2, Search, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import type { CampusEvent } from "@/types";
import type { Timestamp } from "firebase/firestore";

// ─── Schema ───────────────────────────────────────────────────────────────────

const eventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date & time is required"),
  venue: z.string().min(2, "Venue is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
});
type EventFormValues = z.infer<typeof eventSchema>;

// ─── Main Component ───────────────────────────────────────────────────────────

const EventsPage: React.FC = () => {
  const { profile, isAdmin, isHOD, isTeacher } = useAuth();
  const canCreate = isAdmin || isHOD || isTeacher;

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [myRegistrations, setMyRegistrations] = useState<Set<string>>(new Set());

  // ── Real-time events listener ──
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CampusEvent)));
      setLoading(false);
    }, () => { setLoading(false); toast.error("Failed to load events."); });
  }, []);

  // ── Fetch user's registrations ──
  useEffect(() => {
    if (!profile?.uid) return;
    const fetchRegs = async () => {
      const registered = new Set<string>();
      for (const ev of events) {
        if (!ev.id) continue;
        const ref = doc(db, "events", ev.id, "registrations", profile.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) registered.add(ev.id);
      }
      setMyRegistrations(registered);
    };
    fetchRegs();
  }, [events, profile?.uid]);

  const filtered = events.filter(
    (e) => search === "" || e.name.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Campus events and activities</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        )}
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-xl border bg-muted/40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8" />}
          title={search ? "No matching events" : "No events scheduled"}
          description={search ? "Try a different search." : canCreate ? "Create the first campus event." : "Check back soon for upcoming events."}
          action={canCreate && !search ? <Button size="sm" onClick={() => setShowForm(true)}><Plus className="mr-1 h-3 w-3" /> Create Event</Button> : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ev, i) => (
            <EventCard
              key={ev.id}
              event={ev}
              index={i}
              isRegistered={myRegistrations.has(ev.id!)}
              canManage={isAdmin || isHOD || ev.createdBy === profile?.uid}
              userId={profile?.uid ?? ""}
              userName={profile?.name ?? ""}
              userEmail={profile?.email ?? ""}
              onRegistrationChange={(id, registered) => {
                setMyRegistrations((prev) => {
                  const next = new Set(prev);
                  if (registered) {
                    next.add(id);
                  } else {
                    next.delete(id);
                  }
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showForm && <EventFormModal onClose={() => setShowForm(false)} profile={profile} />}
      </AnimatePresence>
    </div>
  );
};

// ─── Event Card ───────────────────────────────────────────────────────────────

interface EventCardProps {
  event: CampusEvent;
  index: number;
  isRegistered: boolean;
  canManage: boolean;
  userId: string;
  userName: string;
  userEmail: string;
  onRegistrationChange: (id: string, registered: boolean) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event, index, isRegistered, canManage, userId, userName, userEmail, onRegistrationChange,
}) => {
  const [registering, setRegistering] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const eventDate = (event.date as Timestamp).toDate();
  const isPastEvent = eventDate < new Date();
  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft <= 0;

  const handleRegister = async () => {
    if (!event.id || !userId) return;
    setRegistering(true);
    try {
      const eventRef = doc(db, "events", event.id);
      const regRef = doc(db, "events", event.id, "registrations", userId);

      if (isRegistered) {
        // Unregister
        await runTransaction(db, async (tx) => {
          const ev = await tx.get(eventRef);
          const count = ev.data()?.registeredCount ?? 0;
          tx.delete(regRef);
          tx.update(eventRef, { registeredCount: Math.max(0, count - 1) });
        });
        toast.success("Unregistered from event.");
        onRegistrationChange(event.id, false);
      } else {
        // Register
        if (isFull) { toast.error("This event is full."); return; }
        const qrData = JSON.stringify({ eventId: event.id, userId, userName, eventName: event.name });
        const qrImage = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

        await runTransaction(db, async (tx) => {
          const ev = await tx.get(eventRef);
          const count = ev.data()?.registeredCount ?? 0;
          if (count >= event.capacity) throw new Error("Event is full");
          tx.set(regRef, {
            uid: userId, userName, userEmail,
            registeredAt: serverTimestamp(),
            qrCodeURL: qrImage,
          });
          tx.update(eventRef, { registeredCount: count + 1 });
        });
        setQrUrl(qrImage);
        setShowQR(true);
        toast.success("Registered! Your QR code is ready.");
        onRegistrationChange(event.id, true);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (!event.id || !confirm("Delete this event and all registrations?")) return;
    try {
      await deleteDoc(doc(db, "events", event.id));
      toast.success("Event deleted.");
    } catch { toast.error("Failed to delete event."); }
  };

  const handleExportCSV = async () => {
    if (!event.id) return;
    try {
      const snap = await getDocs(collection(db, "events", event.id, "registrations"));
      const rows = [["Name", "Email", "Registered At"]];
      snap.forEach((d) => {
        const data = d.data();
        rows.push([
          data.userName ?? "",
          data.userEmail ?? "",
          data.registeredAt?.toDate ? format(data.registeredAt.toDate(), "dd MMM yyyy HH:mm") : "",
        ]);
      });
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${event.name}-attendees.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Attendee list exported.");
    } catch { toast.error("Export failed."); }
  };

  const progressPct = Math.min((event.registeredCount / event.capacity) * 100, 100);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="group rounded-xl border bg-card flex flex-col overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* Banner */}
        <div className="relative h-36 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center overflow-hidden">
          <Calendar className="h-14 w-14 text-blue-500/30" />
          {isPastEvent && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary">Past Event</Badge>
            </div>
          )}
          {canManage && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-7 w-7" onClick={handleExportCSV} aria-label="Export CSV">
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="destructive" className="h-7 w-7" onClick={handleDelete} aria-label="Delete event">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="font-semibold leading-snug line-clamp-1">{event.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{event.description}</p>
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {isPastEvent ? (
                <span>{format(eventDate, "d MMM yyyy, h:mm a")}</span>
              ) : (
                <CountdownTimer date={event.date as Timestamp} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{event.registeredCount} / {event.capacity} registered</span>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isFull ? "bg-red-500" : progressPct > 75 ? "bg-amber-500" : "bg-green-500"}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isFull ? "No spots remaining" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-1 flex gap-2">
            {!isPastEvent && (
              <Button
                size="sm"
                variant={isRegistered ? "outline" : "default"}
                className="flex-1"
                disabled={registering || (isFull && !isRegistered)}
                onClick={handleRegister}
              >
                {registering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                  isRegistered ? <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Registered</> :
                  isFull ? "Full" : "Register"}
              </Button>
            )}
            {isRegistered && (
              <Button size="sm" variant="ghost" onClick={async () => {
                const regDoc = await getDoc(doc(db, "events", event.id!, "registrations", userId));
                const qr = regDoc.data()?.qrCodeURL;
                if (qr) { setQrUrl(qr); setShowQR(true); }
              }}>
                <QrCode className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl border bg-card p-6 shadow-2xl text-center max-w-xs w-full space-y-4"
            >
              <h3 className="font-semibold">Your Entry QR Code</h3>
              <p className="text-xs text-muted-foreground">{event.name}</p>
              {qrUrl && <img src={qrUrl} alt="QR Code" className="mx-auto rounded-lg w-48 h-48" />}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { const a = document.createElement("a"); a.href = qrUrl; a.download = "entry-qr.png"; a.click(); }}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />Save
                </Button>
                <Button size="sm" className="flex-1" onClick={() => setShowQR(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Event Form Modal ─────────────────────────────────────────────────────────

interface EventFormModalProps {
  onClose: () => void;
  profile: ReturnType<typeof useAuth>["profile"];
}

const EventFormModal: React.FC<EventFormModalProps> = ({ onClose, profile }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = useCallback(async (data: EventFormValues) => {
    if (!profile) return;
    try {
      await addDoc(collection(db, "events"), {
        name: data.name,
        description: data.description,
        date: new Date(data.date),
        venue: data.venue,
        capacity: data.capacity,
        registeredCount: 0,
        bannerURL: "",
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
      });
      toast.success("Event created!");
      onClose();
    } catch { toast.error("Failed to create event."); }
  }, [profile, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-2xl border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Create Event</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ev-name">Event Name *</Label>
            <Input id="ev-name" placeholder="e.g. Tech Fest 2025" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-desc">Description *</Label>
            <textarea id="ev-desc" rows={3} placeholder="What's this event about?" {...register("description")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ev-date">Date & Time *</Label>
              <Input id="ev-date" type="datetime-local" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-cap">Capacity *</Label>
              <Input id="ev-cap" type="number" min={1} placeholder="e.g. 100" {...register("capacity", { valueAsNumber: true })} />
              {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-venue">Venue *</Label>
            <Input id="ev-venue" placeholder="e.g. Main Auditorium" {...register("venue")} />
            {errors.venue && <p className="text-xs text-destructive">{errors.venue.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Event"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EventsPage;
