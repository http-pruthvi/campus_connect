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
  User as UserIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavLinkItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

export default function Navbar({ mode, toggleColorMode }: NavbarProps) {
  const { user, setUser } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();
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
      position="sticky" 
      elevation={scrolled ? 4 : 0}
      sx={{ 
        background: scrolled 
          ? theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'
          : 'transparent',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? 'none' : `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        transition: 'all 0.3s ease-in-out',
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 64, md: 72 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h5" 
            component={Link} 
            to="/home"
            sx={{ 
              fontWeight: 800, 
              textDecoration: 'none',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            CampusConnect
          </Typography>
        </Box>

        {/* DESKTOP SEARCH */}
        <Box sx={{ 
          display: { xs: 'none', lg: 'flex' }, 
          alignItems: 'center',
          backgroundColor: alpha(theme.palette.text.primary, 0.05),
          borderRadius: '12px',
          px: 2,
          width: '300px',
          transition: 'all 0.2s',
          border: '1px solid transparent',
          '&:focus-within': {
            backgroundColor: alpha(theme.palette.background.paper, 1),
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
          }
        }}>
          <SearchIcon size={18} style={{ color: theme.palette.text.secondary }} />
          <InputBase
            placeholder="Search everything..."
            sx={{ ml: 1, flex: 1, fontSize: '0.9rem', fontWeight: 500 }}
          />
        </Box>

        {/* RIGHT ACTIONS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
          {user && (
            <>
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
                {links.map((link) => (
                  <Button
                    key={link.label}
                    component={NavLink}
                    to={link.path}
                    sx={{ 
                      color: location.pathname === link.path ? theme.palette.primary.main : theme.palette.text.secondary,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2,
                      '&:hover': { background: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main },
                      position: 'relative',
                      '&.active::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 6,
                        left: '20%',
                        right: '20%',
                        height: '3px',
                        borderRadius: '2px',
                        background: theme.palette.primary.main
                      }
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>

              <Tooltip title="Notifications">
                <IconButton color="inherit" sx={{ p: 1.2 }}>
                  <Badge badgeContent={unreadCount} color="error" overlap="circular">
                    <NotificationsIcon size={22} />
                  </Badge>
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title={mode === 'dark' ? "Light Mode" : "Dark Mode"}>
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ p: 1.2 }}>
              {mode === 'dark' ? <LightModeIcon size={22} /> : <DarkModeIcon size={22} />}
            </IconButton>
          </Tooltip>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 1 }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  {user.role}
                </Typography>
              </Box>
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: `2px solid ${theme.palette.background.paper}`
                }}
              >
                {user.name?.charAt(0)}
              </Avatar>
            </Box>
          ) : (
            <Button 
              component={Link} 
              to="/" 
              variant="contained" 
              size="small"
              sx={{ borderRadius: '10px', fontWeight: 700 }}
            >
              Sign In
            </Button>
          )}

          <IconButton
            edge="end"
            sx={{ display: { xs: "block", md: "none" }, ml: 1 }}
            onClick={toggleMobileMenu}
          >
            <MenuIcon size={24} />
          </IconButton>
        </Box>
      </Toolbar>

      {/* MOBILE DRAWER */}
      <Drawer 
        anchor="right" 
        open={mobileOpen} 
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={800}>Menu</Typography>
          <IconButton onClick={toggleMobileMenu}><SettingsIcon size={20}/></IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 2, pt: 2 }}>
          {user && links.map((link) => (
            <ListItem key={link.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={link.path}
                onClick={toggleMobileMenu}
                sx={{ 
                  borderRadius: '12px',
                  bgcolor: location.pathname === link.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: location.pathname === link.path ? theme.palette.primary.main : 'inherit',
                }}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
          {user && (
            <ListItem disablePadding sx={{ mt: 4 }}>
              <ListItemButton
                onClick={handleLogout}
                sx={{ 
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                }}
              >
                <LogoutIcon size={18} style={{ marginRight: '12px' }} />
                <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
}
