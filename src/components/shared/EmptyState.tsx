import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
};
