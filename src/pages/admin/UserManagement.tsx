import React, { useEffect, useState, useCallback } from "react";
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Search, Users, Trash2, ChevronDown, Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/Skeletons";
import type { UserProfile, UserRole } from "@/types";
import type { Timestamp } from "firebase/firestore";

const ROLE_COLORS: Record<UserRole, string> = {
  admin:   "bg-red-500/10 text-red-600 border-red-500/20",
  hod:     "bg-purple-500/10 text-purple-600 border-purple-500/20",
  teacher: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  student: "bg-green-500/10 text-green-600 border-green-500/20",
};

const DEPARTMENTS = [
  "Computer Science", "Information Technology", "Electronics", "Electrical",
  "Mechanical", "Civil", "Chemical", "Biotechnology", "Mathematics", "Physics",
];

const UserManagementPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("name", "asc"));
    return onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile)));
      setLoading(false);
    }, () => { setLoading(false); toast.error("Failed to load users."); });
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase()) ||
      u.rollNo?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    hod: users.filter((u) => u.role === "hod").length,
    teacher: users.filter((u) => u.role === "teacher").length,
    student: users.filter((u) => u.role === "student").length,
  };

  const handleExportCSV = useCallback(() => {
    const rows = [["Name", "Email", "Role", "Department", "Roll No", "Course", "Year"]];
    filtered.forEach((u) => {
      rows.push([u.name, u.email, u.role, u.department ?? "", u.rollNo ?? "", u.course ?? "", String(u.year ?? "")]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "campus-users.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("User list exported.");
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all campus users and roles</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", count: stats.total, icon: Users },
          { label: "Admin", count: stats.admin, color: "text-red-600" },
          { label: "HOD", count: stats.hod, color: "text-purple-600" },
          { label: "Teacher", count: stats.teacher, color: "text-blue-600" },
          { label: "Student", count: stats.student, color: "text-green-600" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-lg border bg-card p-3 text-center">
            <p className={`text-2xl font-bold ${color ?? ""}`}>{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, email, dept, roll..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs"><Filter className="mr-1 h-3 w-3" />All</TabsTrigger>
            <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
            <TabsTrigger value="hod" className="text-xs">HOD</TabsTrigger>
            <TabsTrigger value="teacher" className="text-xs">Teacher</TabsTrigger>
            <TabsTrigger value="student" className="text-xs">Student</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* User Table */}
      {loading ? (
        <ListSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No users found"
          description={search ? "Try different search terms." : "No users have registered yet."}
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Department</span>
            <span>Joined</span>
            <span className="w-20 text-right">Actions</span>
          </div>

          {/* Rows */}
          <AnimatePresence mode="popLayout">
            {filtered.map((user, i) => (
              <UserRow
                key={user.uid}
                user={user}
                index={i}
                isAdmin={isAdmin}
                isEditing={editingId === user.uid}
                onToggleEdit={() => setEditingId(editingId === user.uid ? null : user.uid)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {users.length} users
      </p>
    </div>
  );
};

// ─── User Row ─────────────────────────────────────────────────────────────────

interface UserRowProps {
  user: UserProfile;
  index: number;
  isAdmin: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, index, isAdmin, isEditing, onToggleEdit }) => {
  const [newRole, setNewRole] = useState<UserRole>(user.role);
  const [newDept, setNewDept] = useState(user.department ?? "");
  const [saving, setSaving] = useState(false);

  const joined = user.createdAt
    ? format((user.createdAt as Timestamp).toDate(), "dd MMM yyyy")
    : "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { role: newRole, department: newDept });
      toast.success(`Updated ${user.name}'s profile.`);
      onToggleEdit();
    } catch { toast.error("Failed to update user."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${user.name}? This removes their profile data.`)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid));
      toast.success(`${user.name}'s profile deleted.`);
    } catch { toast.error("Failed to delete user."); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="border-b last:border-b-0 hover:bg-accent/20 transition-colors"
    >
      {/* Main row */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-2 md:gap-4 items-center px-5 py-3">
        {/* Name + avatar */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 border flex items-center justify-center shrink-0">
            <span className="text-xs font-bold uppercase">{user.name?.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            {user.rollNo && <p className="text-xs text-muted-foreground">{user.rollNo}</p>}
          </div>
        </div>

        {/* Email */}
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>

        {/* Role badge */}
        <div>
          <Badge variant="outline" className={`text-xs capitalize ${ROLE_COLORS[user.role]}`}>
            {user.role}
          </Badge>
        </div>

        {/* Department */}
        <p className="text-sm text-muted-foreground">{user.department || "—"}</p>

        {/* Joined */}
        <p className="text-xs text-muted-foreground">{joined}</p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 w-20">
          {isAdmin && (
            <>
              <Button size="icon" variant="ghost" className="h-7 w-7"
                onClick={onToggleEdit} title="Edit user"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isEditing ? "rotate-180" : ""}`} />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive"
                onClick={handleDelete} title="Delete user"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 flex flex-wrap gap-4 items-end bg-muted/20 border-t">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Role</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="hod">HOD</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Department</label>
                <select value={newDept} onChange={(e) => setNewDept(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">— Select —</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={onToggleEdit}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserManagementPage;
