import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? '#818CF8' : '#4F46E5',
      },
      secondary: {
        main: isDark ? '#38BDF8' : '#0EA5E9',
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  };

  return createTheme(themeOptions);
};
