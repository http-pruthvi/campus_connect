import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  Badge,
  Tooltip,
  InputBase,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useState, useEffect } from "react";

interface NavLinkItem {
  label: string;
  path: string;
}

interface NavbarProps {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

export default function Navbar({ mode, toggleColorMode }: NavbarProps) {
  const { user, setUser } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const role = user?.role;

  const links: NavLinkItem[] = [
    { label: "Home", path: "/home" },
    { label: "Notices", path: "/notices" },
    { label: "Lost & Found", path: "/lostfound" },
    { label: "Mentorship", path: "/queries" },
  ];

  if (role === "ADMIN") {
    links.push({ label: "Admin", path: "/admin" });
    links.push({ label: "Finance", path: "/fees" });
  } else if (role === "HOD") {
    links.push({ label: "HOD", path: "/hod" });
    links.push({ label: "Finance", path: "/fees" });
  } else if (role === "TEACHER") {
    links.push({ label: "Teacher", path: "/teacher" });
    links.push({ label: "Finance", path: "/fees" });
  } else if (role === "STUDENT") {
    links.push({ label: "My Fees", path: "/student" });
  }

  return (
    <AppBar 
      position="fixed" 
      elevation={scrolled ? 4 : 0}
      sx={{ 
        background: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/home"
          sx={{ fontWeight: 800, textDecoration: 'none', color: 'primary.main' }}
        >
          CampusConnect
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user && (
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {links.map((link) => (
                <Button
                  key={link.label}
                  component={NavLink}
                  to={link.path}
                  sx={{ color: location.pathname === link.path ? 'primary.main' : 'text.secondary' }}
                >
                  {link.label}
                </Button>
              ))}
              <IconButton color="inherit">
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
          )}

          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {user && (
            <Avatar 
              sx={{ width: 32, height: 32, ml: 1 }}
              onClick={handleLogout}
            >
              {user.name?.charAt(0)}
            </Avatar>
          )}

          <IconButton
            edge="end"
            sx={{ display: { xs: "block", md: "none" } }}
            onClick={toggleMobileMenu}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
