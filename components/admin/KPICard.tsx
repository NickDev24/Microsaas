'use client';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  icon?: string;
  color?: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'pink';
  sparkline?: number[];
  gauge?: {
    current: number;
    max: number;
  };
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  color = 'blue',
  sparkline,
  gauge 
}: KPICardProps) {
  const colorClasses = {
    green: 'border-green-500/20 bg-green-500/5 shadow-green-glow',
    red: 'border-red-500/20 bg-red-500/5 shadow-red-glow', 
    blue: 'border-blue-500/20 bg-blue-500/5 shadow-blue-glow',
    orange: 'border-orange-500/20 bg-orange-500/5 shadow-orange-glow',
    purple: 'border-purple-500/20 bg-purple-500/5 shadow-purple-glow',
    pink: 'border-pink-500/20 bg-pink-500/5 shadow-pink-glow'
  };

  const trendColors = {
    green: 'text-green-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500'
  };

  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    
    const points = sparkline.map((value, index) => {
      const x = (index / (sparkline.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="60" height="20" className="ml-auto">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={trendColors[color]}
        />
      </svg>
    );
  };

  const renderGauge = () => {
    if (!gauge) return null;
    
    const percentage = (gauge.current / gauge.max) * 100;
    const angle = (percentage * 180) / 100 - 90;
    const radians = (angle * Math.PI) / 180;
    const x2 = 50 + 40 * Math.cos(radians);
    const y2 = 50 + 40 * Math.sin(radians);

    return (
      <svg width="60" height="30" className="ml-auto" viewBox="0 0 100 60">
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-2"
        />
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className={trendColors[color]}
          strokeDasharray={`${percentage * 125.6} 125.6`}
        />
        <circle cx={x2} cy={y2} r="4" className={trendColors[color]} />
      </svg>
    );
  };

  return (
    <div className={`
      p-6 rounded-xl border transition-all duration-300 hover-glow-orange
      ${colorClasses[color]}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-2 mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-2 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <span className="text-2xl opacity-50">{icon}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {trend && (
          <div className="flex items-center gap-1">
            <svg 
              className={`w-4 h-4 ${trend.isUp ? 'text-green-500' : 'text-red-500'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={trend.isUp ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
              />
            </svg>
            <span className={`text-xs font-medium ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isUp ? 'vs mes anterior' : 'vs mes anterior'}
            </span>
          </div>
        )}
        
        {sparkline && renderSparkline()}
        {gauge && renderGauge()}
      </div>
    </div>
  );
}
