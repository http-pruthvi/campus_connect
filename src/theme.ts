import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  palette: {
    primary: {
      main: '#0F172A', // Slate 900 (Premium dark, almost black)
      light: '#334155',
      dark: '#020617',
    },
    secondary: {
      main: '#4F46E5', // Indigo (used for accents now)
      light: '#818CF8',
      dark: '#3730A3',
    },
    error: {
      main: '#EF4444', // Red
      light: '#F87171',
      dark: '#B91C1C',
    },
    success: {
      main: '#10B981', // Green
      light: '#34D399',
      dark: '#047857',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          padding: '8px 20px',
          fontWeight: 600,
          textTransform: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          color: '#ffffff',
          border: '1px solid #020617',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
          '&:hover': {
            background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'none',
          }
        },
        outlined: {
          border: '1px solid #CBD5E1',
          color: '#334155',
          backgroundColor: '#ffffff',
          '&:hover': {
            backgroundColor: '#F8FAFC',
            borderColor: '#94A3B8',
          },
        },
        containedError: {
          background: 'linear-gradient(180deg, #F87171 0%, #EF4444 100%)',
          color: '#ffffff',
          border: '1px solid #B91C1C',
          '&:hover': {
            background: 'linear-gradient(180deg, #FCA5A5 0%, #F87171 100%)',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
        containedSuccess: {
          background: 'linear-gradient(180deg, #34D399 0%, #10B981 100%)',
          color: '#ffffff',
          border: '1px solid #047857',
          '&:hover': {
            background: 'linear-gradient(180deg, #6EE7B7 0%, #34D399 100%)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
        },
        elevation3: {
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          borderRadius: 16,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
          minHeight: 48,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#475569',
          backgroundColor: '#F8FAFC',
        },
      },
    },
  },
});

export default theme;
