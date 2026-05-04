import React, { useState, useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  User, Mail, GraduationCap, Building2, Hash,
  Save, Shield, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Timestamp } from "firebase/firestore";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional(),
  course: z.string().optional(),
  year: z.string().optional(),
  rollNo: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/10 text-red-600 border-red-500/20",
  hod: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  teacher: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  student: "bg-green-500/10 text-green-600 border-green-500/20",
};

const ProfilePage: React.FC = () => {
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      department: profile?.department ?? "",
      course: profile?.course ?? "",
      year: profile?.year ? String(profile.year) : "",
      rollNo: profile?.rollNo ?? "",
    },
  });

  const onSubmit = useCallback(async (data: ProfileFormValues) => {
    if (!profile?.uid) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", profile.uid), {
        name: data.name,
        department: data.department || null,
        course: data.course || null,
        year: data.year ? parseInt(data.year) : null,
        rollNo: data.rollNo || null,
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }, [profile]);

  if (!profile) return null;

  const joined = profile.createdAt
    ? format((profile.createdAt as Timestamp).toDate(), "dd MMM yyyy")
    : "—";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-6"
      >
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold uppercase text-primary">
              {profile.name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge variant="outline" className={`text-xs capitalize ${ROLE_COLORS[profile.role]}`}>
                <Shield className="mr-1 h-3 w-3" />{profile.role}
              </Badge>
              {profile.department && (
                <Badge variant="secondary" className="text-xs">
                  <Building2 className="mr-1 h-3 w-3" />{profile.department}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />Joined {joined}
              </span>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <InfoItem icon={Mail} label="Email" value={profile.email} />
          <InfoItem icon={Hash} label="Roll No" value={profile.rollNo ?? "—"} />
          <InfoItem icon={GraduationCap} label="Course" value={profile.course ?? "—"} />
          <InfoItem icon={Building2} label="Year" value={profile.year ? `Year ${profile.year}` : "—"} />
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border bg-card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="p-name" {...register("name")} className="pl-9" />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-dept">Department</Label>
              <Input id="p-dept" {...register("department")} placeholder="e.g. Computer Science" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-roll">Roll Number</Label>
              <Input id="p-roll" {...register("rollNo")} placeholder="e.g. 21CS101" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-course">Course</Label>
              <Input id="p-course" {...register("course")} placeholder="e.g. B.Tech" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-year">Year</Label>
              <Input id="p-year" type="number" {...register("year")} placeholder="e.g. 3" min={1} max={5} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={saving || !isDirty}>
              {saving ? (
                <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Info Item ────────────────────────────────────────────────────────────────

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5">
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
