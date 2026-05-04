import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Login failed. Please try again.";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        toast.error("Invalid email or password.");
      } else {
        toast.error(msg);
      }
    }
  };

  const handleForgotPassword = async () => {
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    if (!email) {
      toast.error("Enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch {
      toast.error("Could not send reset email. Check the address.");
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
        <SpotlightCard className="p-8 sm:p-10 border-white/10 bg-slate-950/40" spotlightColor="rgba(59, 130, 246, 0.2)">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
          >
            {/* Logo */}
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                <GraduationCap className="h-8 w-8 text-blue-400" />
              </motion.div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Campus Connect
                </h1>
                <p className="mt-1.5 text-sm text-slate-400">
                  Sign in to your campus portal
                </p>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  autoComplete="email"
                  {...register("email")}
                  className="h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className="h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/20 pr-10 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                )}
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="space-y-3">
              <p className="text-center text-xs text-slate-500">
                Having trouble? Contact your{" "}
                <Link to="#" className="text-blue-400 hover:underline">
                  campus administrator
                </Link>
              </p>
              <p className="text-center text-sm text-slate-400">
                New to Campus Connect?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </SpotlightCard>

        {/* Role matrix hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs font-medium tracking-wide text-slate-500/80 uppercase"
        >
          Admin · HOD · Teacher · Student
        </motion.p>
      </motion.div>
    </AuroraBackground>
  );
};

export default Login;
