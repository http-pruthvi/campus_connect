import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "red" | "purple" | "cyan";
  index?: number;
}

const colorMap = {
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  green: "bg-green-500/10 text-green-500 border-green-500/20",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "blue",
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="h-full"
    >
      <SpotlightCard className="h-full p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("rounded-lg border p-2.5", colorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            <span
              className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </SpotlightCard>
    </motion.div>

  );
};
