import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  Dashboard as LayoutDashboard,
  Notifications as Bell,
  CalendarMonth as CalendarDays,
  Description as FileText,
  Search,
  Chat as MessageSquare,
  School as GraduationCap,
  AssignmentTurnedIn as ClipboardCheck,
  Payments as CreditCard,
  ChevronLeft,
  ChevronRight,
  HowToReg as UserCheck,
  Settings,
  Group as Users,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 88;

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

export default function Sidebar() {
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role?.toUpperCase();

  const menuItems: SidebarItem[] = [
    { label: "Dashboard", path: role === 'ADMIN' ? '/admin' : role === 'HOD' ? '/hod' : role === 'TEACHER' ? '/teacher' : '/student', icon: <LayoutDashboard />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Attendance", path: "/attendance", icon: <UserCheck />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Timetable", path: "/timetable", icon: <CalendarDays />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Assignments", path: "/assignments", icon: <FileText />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Marks & Grades", path: "/grades", icon: <GraduationCap />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Chat & Mentorship", path: "/chat", icon: <MessageSquare />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Notices", path: "/notices", icon: <Bell />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Events", path: "/events", icon: <CalendarDays />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Lost & Found", path: "/lostfound", icon: <Search />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Fees & Finance", path: "/fees", icon: <CreditCard />, roles: ["ADMIN", "HOD", "TEACHER"] },
    { label: "User Management", path: "/admin", icon: <Users />, roles: ["ADMIN", "HOD"] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role || ""));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          pt: 10,
        },
      }}
    >
      <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && <Typography variant="overline" sx={{ fontWeight: 800 }}>General</Typography>}
        <IconButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <List sx={{ px: 2 }}>
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                  borderRadius: '12px',
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 3,
                    justifyContent: 'center',
                    color: isActive ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
