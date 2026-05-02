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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

interface NavLinkItem {
  label: string;
  path: string;
}

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }
  }, [user, setUser]);

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

  // Base links
  const links: NavLinkItem[] = [
    { label: "Home", path: "/home" },
    { label: "Notices", path: "/notices" },
    { label: "Lost & Found", path: "/lostfound" },
    { label: "Mentorship & Queries", path: "/queries" },
  ];

  if (role === "ADMIN") {
    links.push({ label: "Admin Panel", path: "/admin" });
    links.push({ label: "Fees Management", path: "/fees" });
  }

  if (role === "HOD") {
    links.push({ label: "HOD Panel", path: "/hod" });
    links.push({ label: "Fees Management", path: "/fees" });
  }

  if (role === "TEACHER") {
    links.push({ label: "Teacher Panel", path: "/teacher" });
    links.push({ label: "Fees Management", path: "/fees" });
  }

  if (role === "STUDENT") {
    links.push({ label: "My Fees", path: "/student" });
  }

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        color: '#1E293B',
        mb: 4
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Campus Connect
        </Typography>

        {/* DESKTOP */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: 'center' }}>
          {user &&
            links.map((link) => (
              <Button
                key={link.label}
                component={NavLink}
                to={link.path}
                sx={{ 
                  color: '#475569', 
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                  '&:hover': { background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', transform: 'none', boxShadow: 'none' },
                  '&.active': { background: 'rgba(79, 70, 229, 0.15)', color: '#4F46E5' }
                } as any}
              >
                {link.label}
              </Button>
            ))}

          {user && (
            <Button 
              onClick={handleLogout}
              sx={{ 
                ml: 2,
                background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E11D48, #BE123C)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
                }
              }}
            >
              Logout
            </Button>
          )}
        </Box>

        {/* MOBILE */}
        {user && (
          <>
            <IconButton
              edge="end"
              sx={{ display: { xs: "block", md: "none" }, color: '#4F46E5' }}
              onClick={toggleMobileMenu}
            >
              <MenuIcon />
            </IconButton>

            <Drawer 
              anchor="right" 
              open={mobileOpen} 
              onClose={toggleMobileMenu}
              PaperProps={{
                sx: { width: 250, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)' }
              }}
            >
              <List sx={{ pt: 4 }}>
                {links.map((link) => (
                  <ListItem key={link.label} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={link.path}
                      onClick={toggleMobileMenu}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600, color: '#1E293B' }} />
                    </ListItemButton>
                  </ListItem>
                ))}

                <ListItem
                  disablePadding
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  sx={{ mt: 2 }}
                >
                  <ListItemButton>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, color: '#E11D48' }} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
