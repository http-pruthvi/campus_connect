import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Bell,
  Calendar,
  MessageSquare,
  Search,
  Ticket,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

import type { UserRole } from "@/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "hod", "teacher", "student"] },
  { title: "Users", href: "/admin/users", icon: Users, roles: ["admin", "hod"] },
  { title: "Notice Board", href: "/shared/notices", icon: Bell, roles: ["admin", "hod", "teacher", "student"] },
  { title: "Events", href: "/shared/events", icon: Calendar, roles: ["admin", "hod", "teacher", "student"] },
  { title: "Q&A Portal", href: "/shared/qna", icon: MessageSquare, roles: ["admin", "hod", "teacher", "student"] },
  { title: "Lost & Found", href: "/student/lost-found", icon: Search, roles: ["admin", "hod", "teacher", "student"] },
  { title: "Queries", href: "/student/queries", icon: Ticket, roles: ["admin", "hod", "student"] },
  { title: "Fees", href: "/student/fees", icon: CreditCard, roles: ["admin", "student"] },
  { title: "Department", href: "/hod/department", icon: Settings, roles: ["hod"] },
];

interface SidebarProps {
  mobile?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobile = false, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { role } = useRole();

  const filteredItems = navItems.filter((item) => role && item.roles.includes(role));

  // On mobile, never collapse — always expanded
  const isCollapsed = mobile ? false : collapsed;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out.");
      navigate("/login");
    } catch {
      toast.error("Logout failed.");
    }
  };

  const handleNavClick = () => {
    // On mobile, close the drawer after navigation
    if (mobile && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300 shrink-0 h-full",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-5">
        <Link to="/dashboard" className="flex items-center gap-3 font-bold text-primary min-w-0" onClick={handleNavClick}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="truncate text-base font-semibold">CampusConnect</span>
          )}
        </Link>
        {/* Mobile close button */}
        {mobile && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredItems.map((item) => {
          const active =
            location.pathname === item.href ||
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              title={isCollapsed ? item.title : undefined}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t p-3 space-y-1">
        {!isCollapsed && (
          <Link
            to="/profile"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 border flex items-center justify-center shrink-0">
              <span className="text-xs font-bold uppercase">
                {profile?.name?.charAt(0) ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{profile?.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {profile?.role}
              </p>
            </div>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
            isCollapsed && "justify-center"
          )}
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      {!mobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[4.5rem] flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </aside>
  );
};
