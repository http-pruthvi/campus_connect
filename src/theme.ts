import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? '#818CF8' : '#4F46E5', // Indigo 400 vs 600
        light: '#A5B4FC',
        dark: '#3730A3',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#38BDF8' : '#0EA5E9', // Sky 400 vs 600
        light: '#7DD3FC',
        dark: '#0369A1',
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F1F5F9' : '#1E293B',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 22px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(79, 70, 229, 0.2)',
            },
          },
          containedPrimary: {
            background: isDark 
              ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' 
              : 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.02)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.04)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
