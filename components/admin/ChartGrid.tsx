'use client';

import { ReactNode } from 'react';

interface ChartGridProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function ChartGrid({ children, title, subtitle }: ChartGridProps) {
  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-muted-2 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Grid Container */}
      <div className="relative bg-surface border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 glow-enhanced animate-scale-in">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-soft via-transparent to-purple-soft opacity-30 rounded-2xl grid-pattern" />
        
        {/* Grid Content */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
          {/* Grid Subdivisions - Visual Lines */}
          <div className="absolute inset-6 grid grid-cols-1 lg:grid-cols-2 gap-6 pointer-events-none">
            {/* Vertical divider for desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent animate-border-glow" />
            {/* Horizontal divider */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent lg:hidden animate-border-glow" />
            {/* Both dividers for desktop */}
            <div className="hidden lg:block absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-border-glow" />
          </div>

          {/* Chart Cells */}
          <div className="chart-cell">
            {Array.isArray(children) ? children[0] : children}
          </div>
          <div className="chart-cell">
            {Array.isArray(children) ? children[1] : null}
          </div>
          <div className="chart-cell">
            {Array.isArray(children) ? children[2] : null}
          </div>
          <div className="chart-cell">
            {Array.isArray(children) ? children[3] : null}
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-accent rounded-tl-lg opacity-60 animate-pulse-slow" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-accent rounded-tr-lg opacity-60 animate-pulse-slow" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-accent rounded-bl-lg opacity-60 animate-pulse-slow" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-accent rounded-br-lg opacity-60 animate-pulse-slow" />
      </div>

      <style jsx>{`
        .chart-cell {
          @apply relative p-4 bg-surface-2 border border-border rounded-xl hover:border-accent/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 card-hover glass-effect;
        }
        
        .chart-cell::before {
          content: '';
          @apply absolute inset-0 bg-gradient-to-br from-accent-soft/20 to-transparent rounded-xl opacity-0 transition-opacity duration-300;
        }
        
        .chart-cell:hover::before {
          @apply opacity-100;
        }

        .chart-cell:hover {
          @apply glow-enhanced;
        }
      `}</style>
    </div>
  );
}
