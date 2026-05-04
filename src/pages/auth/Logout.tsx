import React, { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    signOut(auth)
      .then(() => {
        toast.success("Logged out successfully.");
        navigate("/login");
      })
      .catch(() => {
        toast.error("Failed to log out.");
        navigate("/dashboard");
      });
  }, [navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
};

export default Logout;
