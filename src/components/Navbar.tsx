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
  Menu,
  MenuItem,
  ListItemIcon,
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
import { auth, logout } from "../firebase";

import { styled } from "@mui/material/styles";

interface NavbarProps {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.text.primary, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function Navbar({ mode, toggleColorMode, onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const { user, setUser } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);

  const searchItems = [
    { title: "Home", path: "/home", category: "Navigation" },
    { title: "Attendance", path: "/attendance", category: "Academic" },
    { title: "Timetable", path: "/timetable", category: "Academic" },
    { title: "Assignments", path: "/assignments", category: "Academic" },
    { title: "Lost & Found", path: "/lost-and-found", category: "Campus" },
    { title: "Bus Tracking", path: "/bus-tracking", category: "Campus" },
    { title: "Canteen", path: "/canteen", category: "Campus" },
    { title: "Events", path: "/events", category: "Campus" },
    { title: "Mentorship", path: "/mentorship", category: "Support" },
    { title: "Finance Panel", path: "/finance", category: "Admin" },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = searchItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setSearchAnchorEl(e.currentTarget);
    } else {
      setSearchResults([]);
      setSearchAnchorEl(null);
    }
  };

  const handleSearchItemClick = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setSearchResults([]);
    setSearchAnchorEl(null);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path || path === 'home') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        width: { lg: isSidebarOpen ? `calc(100% - 280px)` : '100%' },
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onToggleSidebar}
            edge="start"
            sx={{ 
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search feature, department..."
            inputProps={{ "aria-label": "search" }}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Search>

        <Menu
          anchorEl={searchAnchorEl}
          open={Boolean(searchAnchorEl && searchResults.length > 0)}
          onClose={() => setSearchAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          disableAutoFocusItem
          PaperProps={{
            sx: { mt: 1, width: 300, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }
          }}
        >
          <Box sx={{ p: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ px: 2, py: 1, display: 'block', fontWeight: 700 }}>
              SEARCH RESULTS
            </Typography>
            {searchResults.map((item, idx) => (
              <MenuItem key={idx} onClick={() => handleSearchItemClick(item.path)} sx={{ borderRadius: 1.5, py: 1 }}>
                <Box>
                  <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                  <Typography variant="caption" color="textSecondary">{item.category}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        </Menu>

          <Typography 
            variant="h6" 
            sx={{ fontWeight: 800, display: { xs: 'none', sm: 'block' } }}
          >
            {getPageTitle()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            borderRadius: 3,
            px: 2,
            py: 0.5,
            width: 260,
            border: '1px solid transparent',
            transition: 'all 0.2s ease',
            '&:focus-within': {
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
            }
          }}>
            <SearchIcon sx={{ color: 'text.disabled', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Search anything..."
              sx={{ fontSize: '0.875rem', width: '100%' }}
            />
          </Box>

          <IconButton onClick={toggleColorMode} sx={{ color: 'text.secondary' }}>
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          <Tooltip title="Notifications">
            <IconButton sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={unreadCount} color="error" variant="dot">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, my: 'auto' }} />

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              <Box 
                sx={{ 
                  textAlign: 'right', 
                  display: { xs: 'none', sm: 'block' },
                  cursor: 'pointer'
                }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <Typography variant="caption" fontWeight={800} display="block" sx={{ lineHeight: 1 }}>
                  {user.name || user.email.split('@')[0]}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                  {user.role || 'Guest'}
                </Typography>
              </Box>
              <Avatar 
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.main',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                {(user.name || user.email).charAt(0).toUpperCase()}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: { mt: 1.5, borderRadius: 3, minWidth: 180, boxShadow: theme.shadows[3] }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/home'); }}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  Profile Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
