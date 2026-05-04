"use no memo";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  UserCircle,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import type { UserRole } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Business Administration",
  "Arts & Humanities",
  "Science",
  "Other",
];

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "student", label: "Student", description: "Access courses, events, fees & queries" },
  { value: "teacher", label: "Teacher", description: "Manage courses, answer Q&A & mentor students" },
  { value: "hod", label: "Head of Department", description: "Department-level management & approvals" },
  { value: "admin", label: "Administrator", description: "Full platform access & user management" },
];

// ─── Zod Schemas (per step) ───────────────────────────────────────────────────
const step1Schema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const step2Schema = z.object({
  role: z.enum(["admin", "hod", "teacher", "student"] as const),
  department: z.string().min(1, "Please select a department"),
  rollNo: z.string().optional(),
  year: z.string().optional(),
  course: z.string().optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

// ─── Main Component ───────────────────────────────────────────────────────────
const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Step 1 form ──
  const {
    register: reg1,
    handleSubmit: handleStep1,
    control: control1,
    formState: { errors: err1 },
  } = useForm<Step1Values>({ resolver: zodResolver(step1Schema) });

  // ── Step 2 form ──
  const {
    register: reg2,
    handleSubmit: handleStep2,
    control: control2,
    formState: { errors: err2 },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { role: "student" },
  });

  const selectedRole = useWatch({ control: control2, name: "role" });
  const password = useWatch({ control: control1, name: "password" }) ?? "";

  // ── Password strength ──
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"][strength];

  const onStep1 = (data: Step1Values) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = async (data: Step2Values) => {
    if (!step1Data) return;
    setIsSubmitting(true);
    try {
      // 1. Create Firebase Auth account
      const credential = await createUserWithEmailAndPassword(
        auth,
        step1Data.email,
        step1Data.password
      );
      const { user } = credential;

      // 2. Update Firebase Auth display name
      await updateProfile(user, { displayName: step1Data.name });

      // 3. Create Firestore user document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: step1Data.name,
        email: step1Data.email,
        role: data.role,
        department: data.department,
        course: data.course || "",
        year: data.year ? parseInt(data.year) : null,
        rollNo: data.rollNo || "",
        photoURL: "",
        onboarded: false,
        preferences: {
          notifications: true,
          theme: "system",
        },
        createdAt: serverTimestamp(),
      });

      toast.success("Account created! Welcome to Campus Connect 🎓");
      navigate("/dashboard");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Registration failed.";
      if (msg.includes("email-already-in-use")) {
        toast.error("This email is already registered. Try logging in.");
        setStep(1);
      } else if (msg.includes("weak-password")) {
        toast.error("Password is too weak.");
        setStep(1);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <SpotlightCard className="overflow-hidden border-white/10 bg-slate-950/40" spotlightColor="rgba(59, 130, 246, 0.2)">
          {/* Progress bar */}
          <div className="h-1 w-full bg-white/5 relative">
            <motion.div
              className="absolute left-0 top-0 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-6 flex flex-col items-center gap-2">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                <GraduationCap className="h-7 w-7 text-blue-400" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
              <p className="text-sm text-slate-400">Join Campus Connect today</p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {[
                { n: 1, label: "Account", icon: UserCircle },
                { n: 2, label: "Profile", icon: BookOpen },
              ].map(({ n, label, icon: Icon }, i) => (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        step > n
                          ? "border-blue-500 bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                          : step === n
                          ? "border-blue-400 bg-blue-400/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                          : "border-white/10 bg-black/20 text-white/30"
                      }`}
                    >
                      {step > n ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors duration-300 ${
                        step === n ? "text-blue-400" : step > n ? "text-blue-500" : "text-white/30"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 1 && (
                    <div
                      className={`h-px w-12 transition-all duration-300 ${
                        step > 1 ? "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.4)]" : "bg-white/10"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step Forms */}
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleStep1(onStep1)}
                  className="space-y-4"
                  noValidate
                >
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-slate-300 text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Pruthvi Husekar"
                      {...reg1("name")}
                      className="h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                    />
                    {err1.name && (
                      <p className="text-xs text-red-400">{err1.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      {...reg1("email")}
                      className="h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                    />
                    {err1.email && (
                      <p className="text-xs text-red-400">{err1.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...reg1("password")}
                        className="h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 pr-10 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Strength meter */}
                    {password.length > 0 && (
                      <div className="space-y-1 mt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i <= strength ? strengthColor : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-[10px] font-medium uppercase tracking-wider ${strengthColor.replace("bg-", "text-")}`}>
                          {strengthLabel}
                        </p>
                      </div>
                    )}
                    {err1.password && (
                      <p className="text-xs text-red-400">{err1.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        {...reg1("confirmPassword")}
                        className="h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 pr-10 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {err1.confirmPassword && (
                      <p className="text-xs text-red-400">{err1.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold mt-4 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  >
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleStep2(onStep2)}
                  className="space-y-4"
                  noValidate
                >
                  {/* Role selection */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm font-medium">I am a... *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((r) => (
                        <label
                          key={r.value}
                          className={`relative flex cursor-pointer flex-col rounded-xl border p-3 transition-all duration-300 ${
                            selectedRole === r.value
                              ? "border-blue-400 bg-blue-400/10 shadow-[inset_0_0_15px_rgba(59,130,246,0.15)]"
                              : "border-white/10 hover:border-white/20 hover:bg-white/5 bg-black/20"
                          }`}
                        >
                          <input
                            type="radio"
                            value={r.value}
                            {...reg2("role")}
                            className="sr-only"
                          />
                          <span className="text-sm font-semibold text-white">{r.label}</span>
                          <span className="text-[10px] text-slate-400 leading-tight mt-1">
                            {r.description}
                          </span>
                          {selectedRole === r.value && (
                            <motion.div
                              layoutId="role-check"
                              className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                            >
                              <Check className="h-2.5 w-2.5 text-white" />
                            </motion.div>
                          )}
                        </label>
                      ))}
                    </div>
                    {err2.role && (
                      <p className="text-xs text-red-400">{err2.role.message}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-slate-300 text-sm font-medium">
                      Department *
                    </Label>
                    <select
                      id="department"
                      {...reg2("department")}
                      className="flex h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all duration-300"
                    >
                      <option value="" className="bg-slate-900">Select department...</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d} className="bg-slate-900">
                          {d}
                        </option>
                      ))}
                    </select>
                    {err2.department && (
                      <p className="text-xs text-red-400">{err2.department.message}</p>
                    )}
                  </div>

                  {/* Student-specific fields */}
                  <AnimatePresence>
                    {selectedRole === "student" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1.5">
                            <Label htmlFor="rollNo" className="text-slate-300 text-sm font-medium">
                              Roll Number
                            </Label>
                            <Input
                              id="rollNo"
                              placeholder="e.g. CS21B042"
                              {...reg2("rollNo")}
                              className="h-10 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="year" className="text-slate-300 text-sm font-medium">
                              Year
                            </Label>
                            <select
                              id="year"
                              {...reg2("year")}
                              className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all duration-300"
                            >
                              <option value="" className="bg-slate-900">Select...</option>
                              {[1, 2, 3, 4, 5].map((y) => (
                                <option key={y} value={String(y)} className="bg-slate-900">
                                  Year {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="course" className="text-slate-300 text-sm font-medium">
                            Course / Program
                          </Label>
                          <Input
                            id="course"
                            placeholder="e.g. B.Tech, MBA, M.Sc"
                            {...reg2("course")}
                            className="h-10 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-11 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white transition-all duration-300"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </SpotlightCard>
      </motion.div>
    </AuroraBackground>
  );
};

export default Register;
