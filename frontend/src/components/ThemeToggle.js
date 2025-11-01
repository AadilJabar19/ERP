import React from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/components/ThemeToggle.scss';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <DarkModeIcon className="theme-icon" fontSize="small" />
      ) : (
        <LightModeIcon className="theme-icon" fontSize="small" />
      )}
    </button>
  );
};

export default ThemeToggle;
