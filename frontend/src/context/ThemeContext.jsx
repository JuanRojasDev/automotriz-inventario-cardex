import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol === 'admin';
  const isViewer = usuario?.rol === 'viewer';

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Colores base según el tema
  const baseColors = {
    light: {
      bg: 'bg-white',
      bgSecondary: 'bg-gray-50',
      bgTertiary: 'bg-gray-100',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-100',
    },
    dark: {
      bg: 'bg-gray-950',
      bgSecondary: 'bg-gray-900',
      bgTertiary: 'bg-gray-800',
      text: 'text-gray-50',
      textSecondary: 'text-gray-400',
      border: 'border-gray-700',
      hover: 'hover:bg-gray-800',
    }
  };

  // Colores específicos por rol: admin=amarillo/amber, operador=azul, viewer=verde
  const roleColors = isAdmin
    ? {
        primary: 'from-amber-500 to-yellow-600',
        primaryLight: 'bg-amber-100 dark:bg-amber-900/40',
        primaryText: 'text-amber-600 dark:text-amber-400',
        secondary: 'from-orange-500 to-amber-600',
        accent: 'bg-amber-500 dark:bg-amber-600',
        accentLight: 'bg-amber-50 dark:bg-amber-950',
        navActive: 'bg-gradient-to-r from-amber-500 to-yellow-600',
      }
    : isViewer
    ? {
        // Viewer - Verde
        primary: 'from-emerald-600 to-green-700',
        primaryLight: 'bg-emerald-100 dark:bg-emerald-900/40',
        primaryText: 'text-emerald-600 dark:text-emerald-400',
        secondary: 'from-teal-600 to-emerald-700',
        accent: 'bg-emerald-500 dark:bg-emerald-600',
        accentLight: 'bg-emerald-50 dark:bg-emerald-950',
        navActive: 'bg-gradient-to-r from-emerald-600 to-green-700',
      }
    : {
        // Operador - Azul
        primary: 'from-blue-600 to-blue-700',
        primaryLight: 'bg-blue-100 dark:bg-blue-900/40',
        primaryText: 'text-blue-600 dark:text-blue-400',
        secondary: 'from-indigo-600 to-blue-700',
        accent: 'bg-blue-500 dark:bg-blue-600',
        accentLight: 'bg-blue-50 dark:bg-blue-950',
        navActive: 'bg-gradient-to-r from-blue-600 to-blue-700',
      };

  const theme = isDark ? baseColors.dark : baseColors.light;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider 
      value={{
        isDark,
        toggleTheme,
        theme,
        roleColors,
        isAdmin,
        isViewer,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return ctx;
};
