import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, LayoutDashboard, Bell, Calendar, MessageSquare,
  Users, CreditCard, Ticket, BookOpen, Package, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";
import { motion, AnimatePresence } from "framer-motion";
import type { UserRole } from "@/types";

interface CommandItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  group: string;
}

const commands: CommandItem[] = [
  { title: "Dashboard",       href: "/dashboard",          icon: LayoutDashboard, roles: ["admin", "hod", "teacher", "student"], group: "Navigation" },
  { title: "Notice Board",    href: "/shared/notices",     icon: Bell,            roles: ["admin", "hod", "teacher", "student"], group: "Navigation" },
  { title: "Events",          href: "/shared/events",      icon: Calendar,        roles: ["admin", "hod", "teacher", "student"], group: "Navigation" },
  { title: "Q&A Portal",      href: "/shared/qna",         icon: MessageSquare,   roles: ["admin", "hod", "teacher", "student"], group: "Navigation" },
  { title: "Lost & Found",    href: "/student/lost-found", icon: Package,         roles: ["admin", "hod", "teacher", "student"], group: "Navigation" },
  { title: "User Management", href: "/admin/users",        icon: Users,           roles: ["admin", "hod"],                      group: "Admin" },
  { title: "Department",      href: "/hod/department",     icon: BookOpen,        roles: ["hod"],                               group: "Admin" },
  { title: "Support Queries", href: "/student/queries",    icon: Ticket,          roles: ["admin", "hod", "student"],            group: "Student" },
  { title: "Fees",            href: "/student/fees",       icon: CreditCard,      roles: ["admin", "student"],                   group: "Student" },
];

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { role } = useRole();

  // Ctrl/Cmd+K toggle
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        setSearchTerm("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const available = commands.filter((c) => role && c.roles.includes(role));
    if (!searchTerm) return available;
    const lower = searchTerm.toLowerCase();
    return available.filter((c) =>
      c.title.toLowerCase().includes(lower) ||
      c.group.toLowerCase().includes(lower)
    );
  }, [role, searchTerm]);

  // Group the results
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((c) => {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    });
    return map;
  }, [filtered]);

  const flatList = useMemo(() => filtered, [filtered]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatList[selectedIndex]) {
      e.preventDefault();
      handleSelect(flatList[selectedIndex]);
    }
  };

  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    navigate(item.href);
  };

  // Closed state — search trigger button
  if (!open) {
    return (
      <Button
        variant="outline"
        className="relative h-9 w-64 justify-start text-sm text-muted-foreground hidden md:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[12vh]"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="w-full max-w-lg bg-card border rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center border-b px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent py-4 px-3 outline-none text-sm"
            />
            <button onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground border rounded px-1.5 py-0.5 hover:bg-muted"
            >
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {flatList.length === 0 ? (
              <div className="py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results for "{searchTerm}"</p>
              </div>
            ) : (
              Array.from(groups.entries()).map(([groupName, items]) => (
                <div key={groupName} className="mb-2 last:mb-0">
                  <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                    {groupName}
                  </p>
                  {items.map((item) => {
                    const globalIdx = flatList.indexOf(item);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                        }`}
                      >
                        <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-left">{item.title}</span>
                        {isSelected && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hints */}
          <div className="border-t px-4 py-2 flex gap-4 text-xs text-muted-foreground">
            <span><kbd className="border rounded px-1 mr-1">↑↓</kbd> Navigate</span>
            <span><kbd className="border rounded px-1 mr-1">↵</kbd> Open</span>
            <span><kbd className="border rounded px-1 mr-1">esc</kbd> Close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
