import React, { Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/shared/Sidebar";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { PageTransition } from "@/components/shared/PageTransition";
import { StatGridSkeleton } from "@/components/shared/Skeletons";
import { ChevronRight, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Route → Title map ────────────────────────────────────────────────────────
const routeTitles: Record<string, string> = {
  "/dashboard":          "Dashboard",
  "/shared/notices":     "Notice Board",
  "/shared/events":      "Events",
  "/shared/qna":         "Q&A Portal",
  "/profile":            "My Profile",
  "/admin/users":        "User Management",
  "/hod/department":     "Department",
  "/student/queries":    "Support Queries",
  "/student/fees":       "Fees",
  "/student/lost-found": "Lost & Found",
};

function getTitle(pathname: string): string {
  for (const [key, title] of Object.entries(routeTitles)) {
    if (pathname === key || pathname.startsWith(key + "/")) return title;
  }
  return "Campus Connect";
}

// ─── Top Loading Bar ──────────────────────────────────────────────────────────
const TopBar: React.FC<{ loading: boolean }> = ({ loading }) => (
  <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none">
    <div
      className={`h-full bg-primary transition-all duration-300 ease-out ${
        loading ? "w-[85%] opacity-100" : "w-full opacity-0"
      }`}
      style={{ transitionProperty: "width, opacity" }}
    />
  </div>
);

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────
const Breadcrumbs: React.FC<{ pathname: string }> = ({ pathname }) => {
  const navigate = useNavigate();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground" aria-label="breadcrumb">
      <button onClick={() => navigate("/dashboard")} className="hover:text-foreground transition-colors">
        <Home className="h-3 w-3" />
      </button>
      {parts.map((part, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const label = routeTitles[href] ?? part.replace(/-/g, " ");
        const isLast = i === parts.length - 1;
        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 opacity-40" />
            {isLast ? (
              <span className="text-foreground font-medium capitalize">{label}</span>
            ) : (
              <button onClick={() => navigate(href)} className="hover:text-foreground capitalize transition-colors">
                {label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// ─── Mobile Drawer Overlay ────────────────────────────────────────────────────
const MobileDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const location = useLocation();

  // Auto-close on navigation
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 md:hidden"
          >
            <Sidebar mobile onMobileClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── AppShell ─────────────────────────────────────────────────────────────────
export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Simulate route transition loading bar
  useEffect(() => {
    const t1 = setTimeout(() => setLoading(true), 0);
    const t2 = setTimeout(() => setLoading(false), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.pathname]);

  // Scroll restoration on route change
  useEffect(() => {
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const title = getTitle(location.pathname);

  // Update document title
  useEffect(() => {
    document.title = `${title} — Campus Connect`;
  }, [title]);

  return (
    <>
      <TopBar loading={loading} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6 bg-card/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-semibold leading-none">{title}</h2>
                <div className="hidden sm:block">
                  <Breadcrumbs pathname={location.pathname} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <CommandPalette />
              <ThemeToggle />
              <NotificationBell />
            </div>
          </header>

          {/* Main content with page transitions */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto scroll-smooth"
            style={{ scrollBehavior: "smooth" }}
          >
            <div className="p-4 sm:p-6 md:p-8 max-w-screen-2xl mx-auto">
              <AnimatePresence mode="wait" initial={false}>
                <PageTransition key={location.pathname}>
                  <Suspense fallback={<StatGridSkeleton />}>
                    {children}
                  </Suspense>
                </PageTransition>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
