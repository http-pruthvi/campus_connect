import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    if (!auth.currentUser) return;
    try {
      await updatePassword(auth.currentUser, data.newPassword);
      // Mark user as onboarded so they don't get this screen again
      await updateDoc(doc(db, "users", auth.currentUser.uid), { onboarded: true });
      toast.success("Password updated successfully!");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to update password. You may need to re-authenticate.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/20 border border-green-400/30">
              <ShieldCheck className="h-8 w-8 text-green-400" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Set Your Password</h1>
              <p className="mt-1 text-sm text-slate-400">
                This is your first login. Please set a new secure password.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-300 text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("newPassword")}
                  className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label="Toggle password visibility"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-400">{errors.newPassword.message}</p>
              )}
              <ul className="text-xs text-slate-500 space-y-0.5 pl-2">
                <li>• At least 8 characters</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one number</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-green-600 hover:bg-green-500 text-white font-semibold"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                "Set Password & Continue"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <GraduationCap className="h-4 w-4" />
            Campus Connect
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
