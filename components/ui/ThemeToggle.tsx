'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../providers/useTheme';
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm hover:shadow-md transition-all duration-200 ${
        size === 'sm' ? 'w-9 h-9' : 'w-10 h-10'
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={mounted ? (theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro') : 'Cambiar tema'}
      title={mounted ? (theme === 'dark' ? 'Tema oscuro' : 'Tema claro') : 'Tema'}
    >
      {mounted ? (
        theme === 'dark' ? (
          <svg className={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 12.1A9 9 0 1 1 11.9 3a7 7 0 0 0 9.1 9.1Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg className={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.93 4.93 6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17.66 17.66 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.93 19.07 6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17.66 6.34 19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      ) : (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
      )}
    </motion.button>
  );
}
