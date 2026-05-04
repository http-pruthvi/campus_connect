import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  Calendar,
  CreditCard,
  Bell,
  Search,
  Ticket,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/shared/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

// ─── Admin Dashboard ────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const revenueData: { month: string; revenue: number }[] = [];
  const queryResolutionData: { name: string; value: number; color: string }[] = [];

  const stats = [
    { title: "Total Users", value: "—", description: "Across all departments", icon: Users, color: "blue" as const, index: 0 },
    { title: "Open Queries", value: "—", description: "Awaiting response", icon: Ticket, color: "amber" as const, index: 1 },
    { title: "Active Events", value: "—", description: "Events this month", icon: Calendar, color: "green" as const, index: 2 },
    { title: "Fee Collection", value: "—", description: "This semester", icon: CreditCard, color: "purple" as const, index: 3 },
  ];

  const quickActions = [
    { label: "Post a Notice", icon: Bell, href: "/shared/notices", color: "bg-blue-500" },
    { label: "Create Event", icon: Calendar, href: "/shared/events", color: "bg-green-500" },
    { label: "Manage Users", icon: Users, href: "/admin/users", color: "bg-purple-500" },
    { label: "View Queries", icon: Ticket, href: "/student/queries", color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good {getGreeting()}, {profile?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening across your campus today.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs capitalize hidden md:flex">
          Admin
        </Badge>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Charts & Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border bg-card p-6"
        >
          <h2 className="text-base font-semibold mb-6">Revenue Overview (Fees)</h2>
          {revenueData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip
                    cursor={{ fill: '#334155', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg">
              <p className="text-muted-foreground text-sm">No revenue data available.</p>
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-6 flex flex-col"
        >
          <h2 className="text-base font-semibold mb-2">Query Resolution</h2>
          {queryResolutionData.length > 0 ? (
            <>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={queryResolutionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {queryResolutionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {queryResolutionData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg min-h-[200px]">
              <p className="text-muted-foreground text-sm">No query data available.</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                onClick={() => navigate(action.href)}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors group"
              >
                <div className={`rounded-lg p-2 ${action.color}/10`}>
                  <action.icon className={`h-4 w-4 ${action.color.replace("bg-", "text-")}`} />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-4 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-base font-semibold">System Alerts</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">High query volume</p>
                <p className="text-xs text-muted-foreground">12 new queries in CS department last hour.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Pending Approvals</p>
                <p className="text-xs text-muted-foreground">5 events waiting for admin review.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <RecentActivity />
    </div>
  );
};

// ─── HOD Dashboard ──────────────────────────────────────────────────────────

export const HODDashboard: React.FC = () => {
  const { profile } = useAuth();
  const departmentData: { year: string; students: number }[] = [];
  const pendingApprovals: { id: string; type: string; user: string; desc: string }[] = [];

  const stats = [
    { title: "Faculty Members", value: "—", description: "In your department", icon: Users, color: "blue" as const, index: 0 },
    { title: "Dept. Events", value: "—", description: "Upcoming this month", icon: Calendar, color: "green" as const, index: 1 },
    { title: "Pending Approvals", value: "—", description: "Leave & queries", icon: Ticket, color: "amber" as const, index: 2 },
    { title: "Q&A Questions", value: "—", description: "Unanswered student questions", icon: MessageSquare, color: "purple" as const, index: 3 },
  ];

      {/* Delete this block since it's now imported */}

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good {getGreeting()}, {profile?.name?.split(" ")[0] || "HOD"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Department: <span className="font-medium text-foreground">{profile?.department || "—"}</span>
          </p>
        </div>
        <Badge variant="secondary" className="text-xs capitalize hidden md:flex">
          Head of Department
        </Badge>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Department Overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border bg-card p-6"
        >
          <h2 className="text-base font-semibold mb-6">Students Overview</h2>
          {departmentData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={departmentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg">
              <p className="text-muted-foreground text-sm">No department data available.</p>
            </div>
          )}
        </motion.div>

        {/* Pending Approvals Queue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Pending Approvals</h2>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">{pendingApprovals.length} Action(s)</Badge>
          </div>
          {pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-400">{item.type}</span>
                    <span className="text-xs text-muted-foreground">{item.user}</span>
                  </div>
                  <p className="text-sm">{item.desc}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-500 flex-1">Approve</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs flex-1">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-muted-foreground text-sm">All caught up!</p>
            </div>
          )}
        </motion.div>
      </div>

      <RecentActivity />
    </div>
  );
};

// ─── Teacher Dashboard ───────────────────────────────────────────────────────

export const TeacherDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const todaysSchedule: { id: string; time: string; class: string; location: string; type: string }[] = [];
  const pendingQuestions: { id: string; student: string; course: string; time: string; text: string }[] = [];

  const stats = [
    { title: "Assigned Courses", value: "—", description: "This semester", icon: TrendingUp, color: "blue" as const, index: 0 },
    { title: "My Mentees", value: "—", description: "Students under mentorship", icon: Users, color: "green" as const, index: 1 },
    { title: "Open Questions", value: "—", description: "Awaiting your response", icon: MessageSquare, color: "amber" as const, index: 2 },
    { title: "Events Posted", value: "—", description: "Active campus events", icon: Calendar, color: "purple" as const, index: 3 },
  ];

      {/* Delete todaysSchedule */}

      {/* Delete pendingQuestions */}

  const quickActions = [
    { label: "Post Notice to Class", icon: Bell, href: "/shared/notices", color: "bg-blue-500" },
    { label: "Answer Q&A", icon: MessageSquare, href: "/shared/qna", color: "bg-purple-500" },
    { label: "Create Event", icon: Calendar, href: "/shared/events", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good {getGreeting()}, {profile?.name?.split(" ")[0] || "Teacher"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Here's your teaching overview.</p>
        </div>
        <Badge variant="secondary" className="text-xs capitalize hidden md:flex">
          Teacher
        </Badge>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold">Today's Schedule</h2>
          </div>
          {todaysSchedule.length > 0 ? (
            <div className="relative border-l border-white/10 ml-3 space-y-6">
              {todaysSchedule.map((item, i) => (
                <div key={i} className="pl-6 relative">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-card" />
                  <p className="text-sm font-semibold">{item.class}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6">
              <p className="text-muted-foreground text-sm">No classes scheduled.</p>
            </div>
          )}
        </motion.div>

        <div className="lg:col-span-2 space-y-4">
          {/* Quick Actions */}
          <div className="grid gap-3 sm:grid-cols-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                onClick={() => navigate(action.href)}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors group"
              >
                <div className={`rounded-lg p-2 ${action.color}/10`}>
                  <action.icon className={`h-4 w-4 ${action.color.replace("bg-", "text-")}`} />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Pending Q&A */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Pending Questions (Q&A)</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/shared/qna')}>View All</Button>
            </div>
            {pendingQuestions.length > 0 ? (
              <div className="space-y-3">
                {pendingQuestions.map((q) => (
                  <div key={q.id} className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/5 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                          {q.student[0]}
                        </div>
                        <span className="text-sm font-medium">{q.student}</span>
                        <Badge variant="outline" className="text-[10px] h-5">{q.course}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">"{q.text}"</p>
                    <Button size="sm" variant="secondary" className="w-fit h-7 text-xs mt-1">Reply</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-muted-foreground text-sm">All caught up!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <RecentActivity />
    </div>
  );
};

// ─── Student Dashboard ───────────────────────────────────────────────────────

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { title: "Fee Status", value: "—", description: "All dues cleared", icon: CreditCard, color: "green" as const, index: 0 },
    { title: "Upcoming Events", value: "—", description: "You're registered for 1", icon: Calendar, color: "blue" as const, index: 1 },
    { title: "Open Queries", value: "—", description: "Awaiting admin reply", icon: Ticket, color: "amber" as const, index: 2 },
    { title: "Lost & Found", value: "—", description: "New items near you", icon: Search, color: "purple" as const, index: 3 },
  ];

  const quickActions = [
    { label: "View Notices", icon: Bell, href: "/shared/notices" },
    { label: "Register for Event", icon: Calendar, href: "/shared/events" },
    { label: "Raise a Query", icon: Ticket, href: "/student/queries" },
    { label: "Lost & Found", icon: Search, href: "/student/lost-found" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">
          Good {getGreeting()}, {profile?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {profile?.department && profile?.year
            ? `${profile.department} · Year ${profile.year} · Roll ${profile.rollNo || "—"}`
            : "Welcome to Campus Connect."}
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              onClick={() => navigate(action.href)}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors group"
            >
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{action.label}</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </div>

      <RecentActivity />
    </div>
  );
};

// ─── Shared: Recent Activity Widget ─────────────────────────────────────────

const activityColor: Record<string, string> = {
  notice: "bg-blue-500",
  event: "bg-green-500",
  query: "bg-amber-500",
};

const RecentActivity: React.FC = () => {
  const mockActivity: { id: string; type: string; title: string; time: string; message: string; icon: React.ElementType }[] = [];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl border bg-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Recent Activity</h2>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          View All
        </Button>
      </div>
      {mockActivity.length > 0 ? (
        <div className="space-y-4">
          {mockActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${activityColor[item.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{item.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6">
          <p className="text-muted-foreground text-sm">No recent activity.</p>
        </div>
      )}
    </motion.div>
  );
};

// ─── Utility ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
