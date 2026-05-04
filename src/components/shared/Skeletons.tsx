import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("animate-pulse rounded-md bg-muted/70", className)} />
);

// Pre-built skeletons for common patterns
export const CardSkeleton: React.FC = () => (
  <div className="rounded-xl border bg-card p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-9 w-9 rounded-lg" />
    </div>
    <Skeleton className="h-2 w-16 mt-2" />
  </div>
);

export const StatGridSkeleton: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
  </div>
);

export const ListItemSkeleton: React.FC = () => (
  <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-24 mt-1" />
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => <ListItemSkeleton key={i} />)}
  </div>
);

export const EventCardSkeleton: React.FC = () => (
  <div className="rounded-xl border bg-card overflow-hidden">
    <Skeleton className="h-36 w-full rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Skeleton className="h-8 w-full rounded-md mt-2" />
    </div>
  </div>
);

export const EventGridSkeleton: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
  </div>
);
