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
  Avatar,
  Button,
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
  SupervisorAccount as PersonStanding,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const SIDEBAR_WIDTH = 280;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant: "permanent" | "persistent" | "temporary";
}

export default function Sidebar({ isOpen, onClose, variant }: SidebarProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();

  const role = user?.role?.toUpperCase() || "";

  const menuItems: SidebarItem[] = [
    { label: "Overview", path: "/home", icon: <LayoutDashboard />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Attendance", path: "/attendance", icon: <UserCheck />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Timetable", path: "/timetable", icon: <CalendarDays />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Assignments", path: "/assignments", icon: <FileText />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Marks & Grades", path: "/grades", icon: <GraduationCap />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Campus Chat", path: "/chat", icon: <MessageSquare />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Notice Board", path: "/notices", icon: <Bell />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Campus Events", path: "/events", icon: <CalendarDays />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Lost & Found", path: "/lostfound", icon: <Search />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Mentorship", path: "/mentorship", icon: <PersonStanding />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
    { label: "Queries & Help", path: "/queries", icon: <MessageSquare />, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT", ""] },
  ];

  const adminItems: SidebarItem[] = [
    { label: "Fees & Finance", path: "/fees", icon: <CreditCard />, roles: ["ADMIN", "HOD", "TEACHER", ""] },
    { label: "User Management", path: role === 'HOD' ? '/hod' : '/admin', icon: <Users />, roles: ["ADMIN", "HOD", ""] },
  ];

  const renderList = (items: SidebarItem[], title?: string) => (
    <Box sx={{ mb: 3 }}>
      {title && isOpen && (
        <Typography 
          variant="caption" 
          sx={{ 
            px: 3, 
            mb: 1, 
            display: 'block', 
            fontWeight: 800, 
            color: 'text.disabled', 
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {title}
        </Typography>
      )}
      <List sx={{ px: 2 }}>
        {items.filter(item => item.roles.includes(role || "")).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={variant === 'temporary' ? onClose : undefined}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: '12px',
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.04),
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: 'center',
                    color: isActive ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.875rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={isOpen}
      onClose={onClose}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ p: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            width: 32, 
            height: 32,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <GraduationCap fontSize="small" />
        </Avatar>
        <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.5px' }}>
          CampusConnect
        </Typography>
      </Box>

      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {renderList(menuItems, "Menu")}
        {role !== 'STUDENT' && renderList(adminItems, "Administration")}
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ 
          p: 2, 
          borderRadius: 4, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="caption" fontWeight={800} color="primary" display="block">
            Support
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 1.5, display: 'block' }}>
            Need help with anything?
          </Typography>
          <Button 
            fullWidth 
            variant="contained" 
            size="small" 
            sx={{ 
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' }
            }}
          >
            Contact Admin
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
