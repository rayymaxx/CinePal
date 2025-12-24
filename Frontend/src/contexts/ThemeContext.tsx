import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';
import { useUIStore } from '../store';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const themes: Theme[] = [
  {
    id: 'eccentric-blue',
    name: 'Eccentric Blue',
    primary: '#0066ff',
    secondary: '#00bfff',
    accent: '#0052cc',
    background: '#0f0f23',
    text: '#ffffff',
    className: 'theme-eccentric-blue'
  },
  {
    id: 'cinema-classic',
    name: 'Cinema Classic',
    primary: '#dc143c',
    secondary: '#ffd700',
    accent: '#8b0000',
    background: '#1a0a0a',
    text: '#ffffff',
    className: 'theme-cinema-classic'
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    primary: '#6b46c1',
    secondary: '#ec4899',
    accent: '#9333ea',
    background: '#1a0f2e',
    text: '#ffffff',
    className: 'theme-midnight-purple'
  },
  {
    id: 'netflix-dark',
    name: 'Netflix Dark',
    primary: '#e50914',
    secondary: '#141414',
    accent: '#0f0f0f',
    background: '#000000',
    text: '#ffffff',
    className: 'theme-netflix-dark'
  },
  {
    id: 'retro-neon',
    name: 'Retro Neon',
    primary: '#ff1493',
    secondary: '#00ff41',
    accent: '#ff6b35',
    background: '#0a0a0a',
    text: '#ffffff',
    className: 'theme-retro-neon'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#84cc16',
    accent: '#10b981',
    background: '#0f1a0f',
    text: '#ffffff',
    className: 'theme-forest-green'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    primary: '#ff6b35',
    secondary: '#fbbf24',
    accent: '#f97316',
    background: '#1a0f0a',
    text: '#ffffff',
    className: 'theme-sunset-orange'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    primary: '#ffffff',
    secondary: '#6b7280',
    accent: '#000000',
    background: '#000000',
    text: '#ffffff',
    className: 'theme-monochrome'
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme: themeId, setTheme: setThemeId } = useUIStore();
  // Initialize with fallback theme to prevent undefined
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  console.log('ThemeProvider initializing - themeId:', themeId, 'currentTheme:', currentTheme);

  useEffect(() => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    console.log('ThemeProvider - switching to theme:', theme.id);
    setCurrentTheme(theme);
  }, [themeId]);

  useEffect(() => {
    // Ensure theme is applied immediately
    if (currentTheme) {
      console.log('ThemeProvider - applying theme styles:', currentTheme.id);
      document.body.className = currentTheme.className;
      // Fix CSS variable names to match index.css
      document.documentElement.style.setProperty('--primary', currentTheme.primary);
      document.documentElement.style.setProperty('--secondary', currentTheme.secondary);
      document.documentElement.style.setProperty('--accent', currentTheme.accent);
      document.documentElement.style.setProperty('--background', currentTheme.background);
      document.documentElement.style.setProperty('--text', currentTheme.text);
    }
  }, [currentTheme]);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    setThemeId(theme.id);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};