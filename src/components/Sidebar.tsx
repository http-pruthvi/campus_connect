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
  Tooltip,
} from "@mui/material";
import {
  LayoutDashboard,
  Bell,
  CalendarDays,
  FileText,
  Search,
  MessageSquare,
  GraduationCap,
  ClipboardCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Settings,
  Users,
} from "lucide-react";
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
    { label: "Dashboard", path: role === 'ADMIN' ? '/admin' : role === 'HOD' ? '/hod' : role === 'TEACHER' ? '/teacher' : '/student', icon: <LayoutDashboard size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Attendance", path: "/attendance", icon: <UserCheck size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Timetable", path: "/timetable", icon: <CalendarDays size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Assignments", path: "/assignments", icon: <FileText size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Marks & Grades", path: "/grades", icon: <GraduationCap size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Chat & Mentorship", path: "/chat", icon: <MessageSquare size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Notices", path: "/notices", icon: <Bell size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Events", path: "/events", icon: <CalendarDays size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Lost & Found", path: "/lostfound", icon: <Search size={22} />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { label: "Fees & Finance", path: "/fees", icon: <CreditCard size={22} />, roles: ["ADMIN", "HOD", "TEACHER"] },
    { label: "User Management", path: "/admin", icon: <Users size={22} />, roles: ["ADMIN", "HOD"] },
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
          pt: 10, // Account for sticky navbar
        },
      }}
    >
      <Box sx={{ px: collapsed ? 2 : 3, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <Typography variant="overline" sx={{ fontWeight: 800, color: theme.palette.text.secondary }}>
            General
          </Typography>
        )}
        <IconButton 
          onClick={() => setCollapsed(!collapsed)}
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </IconButton>
      </Box>

      <List sx={{ px: 2 }}>
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ""} placement="right">
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
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      color: theme.palette.primary.main,
                    },
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
                  {!collapsed && (
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{ 
                        fontWeight: isActive ? 700 : 600,
                        fontSize: '0.9rem'
                      }} 
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <ListItemButton
          sx={{
            borderRadius: '12px',
            justifyContent: collapsed ? 'center' : 'initial',
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 3, justifyContent: 'center' }}>
            <Settings size={20} />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 600 }} />}
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
