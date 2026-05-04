import React from "react";
import { motion } from "framer-motion";
import { SearchX, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md space-y-6"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <SearchX className="h-12 w-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button variant="default" className="w-full sm:w-auto" onClick={() => window.location.href = "/dashboard"}>
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
