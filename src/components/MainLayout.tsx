import { Box, useTheme, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";

interface MainLayoutProps {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

export default function MainLayout({ mode, toggleColorMode }: MainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar mode={mode} toggleColorMode={toggleColorMode} />
      
      {!isMobile && <Sidebar />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { xs: '100%', md: `calc(100% - 280px)` },
          minHeight: '100vh',
          pt: { xs: 10, md: 12 }, // Space for fixed navbar
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Box>
    </Box>
  );
}
