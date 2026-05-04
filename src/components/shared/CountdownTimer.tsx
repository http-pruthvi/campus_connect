import React, { useEffect, useState, useCallback } from "react";
import { differenceInSeconds, format, isPast } from "date-fns";
import type { Timestamp } from "firebase/firestore";

interface CountdownProps {
  date: Timestamp;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const CountdownTimer: React.FC<CountdownProps> = ({ date }) => {
  const target = date.toDate();

  const calc = useCallback((): TimeLeft | null => {
    const diff = differenceInSeconds(target, new Date());
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  }, [target]);

  const [left, setLeft] = useState<TimeLeft | null>(calc);

  useEffect(() => {
    if (isPast(target)) return;
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [target, calc]);

  if (!left) {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        {format(target, "d MMM yyyy, h:mm a")}
      </span>
    );
  }

  const units = left.days > 0
    ? [{ v: left.days, l: "d" }, { v: left.hours, l: "h" }, { v: left.minutes, l: "m" }]
    : [{ v: left.hours, l: "h" }, { v: left.minutes, l: "m" }, { v: left.seconds, l: "s" }];

  return (
    <div className="flex items-center gap-1.5">
      {units.map(({ v, l }) => (
        <div key={l} className="flex items-baseline gap-0.5">
          <span className="text-sm font-bold tabular-nums">{pad(v)}</span>
          <span className="text-[10px] text-muted-foreground">{l}</span>
        </div>
      ))}
    </div>
  );
};
