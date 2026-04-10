'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function AnimatedButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button'
}: AnimatedButtonProps) {
  const getBaseClasses = () => {
    const base = 'font-bold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background';
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    const variants = {
      primary: 'bg-accent text-white hover:opacity-95 focus:ring-accent/40 shadow-sm',
      secondary: 'bg-foreground text-background hover:opacity-90 focus:ring-foreground/10',
      outline: 'border-2 border-border text-foreground hover:bg-surface-2 focus:ring-foreground/10'
    };
    
    return `${base} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={getBaseClasses()}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
