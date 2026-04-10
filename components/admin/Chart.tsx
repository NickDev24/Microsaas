'use client';

import { useEffect, useState } from 'react';

type ChartDatum = {
  label: string;
  value: number;
};

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'funnel';
  data: ChartDatum[];
  title: string;
  height?: number;
  color?: string;
  animated?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export function Chart({ type, data, title, height = 300, color = '#fb923c', animated = true, showLegend = true, showTooltip = true }: ChartProps) {
  const [isVisible, setIsVisible] = useState(!animated);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    if (!animated) return;

    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [animated]);
  const renderLineChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} className="w-full">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area */}
        <path
          d={`M 0,${height} L ${points} L 100,${height} Z`}
          fill="url(#gradient)"
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{
            animationDelay: '200ms',
            animation: isVisible ? 'slideUp 0.8s ease-out' : 'none'
          }}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100 stroke-2' : 'opacity-0 stroke-0'}`}
          style={{
            animationDelay: '400ms',
            animation: isVisible ? 'slideUp 0.8s ease-out' : 'none'
          }}
        />
        
        {/* Points */}
        {data.map((d, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - (d.value / maxValue) * 100;
          const isHovered = hoveredItem === index;
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? "6" : "3"}
                fill={color}
                className="cursor-pointer transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  animationDelay: `${600 + index * 100}ms`,
                  animation: isVisible ? 'slideUp 0.6s ease-out' : 'none'
                }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              />
              {isHovered && showTooltip && (
                <g>
                  <rect
                    x={x - 30}
                    y={y - 35}
                    width="60"
                    height="25"
                    fill="rgba(0,0,0,0.8)"
                    rx="4"
                    className="animate-slide-up"
                  />
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    className="text-xs fill-white font-medium"
                  >
                    {d.value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 80 / data.length;

    return (
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} className="w-full">
        {data.map((d, index) => {
          const barHeight = (d.value / maxValue) * (height - 20);
          const x = 10 + index * barWidth;
          const y = height - barHeight - 10;
          const isHovered = hoveredItem === index;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill={color}
                className="cursor-pointer transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                  transformOrigin: 'bottom',
                  animationDelay: `${200 + index * 100}ms`,
                  animation: isVisible ? 'slideUp 0.6s ease-out' : 'none',
                  fillOpacity: isHovered ? 1 : 0.8
                }}
                rx="2"
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              />
              <text
                x={x + barWidth * 0.4}
                y={height - 2}
                textAnchor="middle"
                className="text-xs fill-current text-muted-2 transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  animationDelay: `${400 + index * 100}ms`,
                  animation: isVisible ? 'slideUp 0.6s ease-out' : 'none'
                }}
              >
                {d.label}
              </text>
              {isHovered && showTooltip && (
                <g>
                  <rect
                    x={x + barWidth * 0.4 - 20}
                    y={y - 25}
                    width="40"
                    height="20"
                    fill="rgba(0,0,0,0.8)"
                    rx="3"
                    className="animate-slide-up"
                  />
                  <text
                    x={x + barWidth * 0.4}
                    y={y - 10}
                    textAnchor="middle"
                    className="text-xs fill-white font-medium"
                  >
                    {d.value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -90;

    const colors = ['#fb923c', '#a855f7', '#ec4899', '#3b82f6', '#22c55e'];

    return (
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} className="w-full">
        {data.map((d, index) => {
          const percentage = (d.value / total) * 100;
          const angle = (percentage * 360) / 100;
          const endAngle = currentAngle + angle;
          const isHovered = hoveredItem === index;
          
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle = endAngle;
          
          return (
            <g key={index}>
              <path
                d={pathData}
                fill={colors[index % colors.length]}
                className="cursor-pointer transition-all duration-300"
                style={{
                  opacity: isVisible ? (isHovered ? 1 : 0.8) : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0)',
                  transformOrigin: 'center',
                  animationDelay: `${200 + index * 150}ms`,
                  animation: isVisible ? 'slideUp 0.8s ease-out' : 'none',
                  filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
                }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              />
              <text
                x={50 + 55 * Math.cos(((currentAngle - angle/2) * Math.PI) / 180)}
                y={50 + 55 * Math.sin(((currentAngle - angle/2) * Math.PI) / 180)}
                textAnchor="middle"
                className="text-xs fill-current text-foreground font-medium transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  animationDelay: `${600 + index * 150}ms`,
                  animation: isVisible ? 'slideUp 0.6s ease-out' : 'none',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {`${percentage.toFixed(1)}%`}
              </text>
              {isHovered && showTooltip && (
                <g>
                  <rect
                    x={50 + 55 * Math.cos(((currentAngle - angle/2) * Math.PI) / 180) - 25}
                    y={50 + 55 * Math.sin(((currentAngle - angle/2) * Math.PI) / 180) - 30}
                    width="50"
                    height="25"
                    fill="rgba(0,0,0,0.8)"
                    rx="4"
                    className="animate-slide-up"
                  />
                  <text
                    x={50 + 55 * Math.cos(((currentAngle - angle/2) * Math.PI) / 180)}
                    y={50 + 55 * Math.sin(((currentAngle - angle/2) * Math.PI) / 180) - 12}
                    textAnchor="middle"
                    className="text-xs fill-white font-medium"
                  >
                    {d.label}: {d.value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderFunnelChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const sectionHeight = (height - 20) / data.length;

    return (
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} className="w-full">
        {data.map((d, index) => {
          const width = (d.value / maxValue) * 80;
          const x = (100 - width) / 2;
          const y = 10 + index * sectionHeight;
          const nextWidth = index < data.length - 1 
            ? (data[index + 1].value / maxValue) * 80 
            : width;
          const nextX = (100 - nextWidth) / 2;
          const isHovered = hoveredItem === index;
          
          const pathData = [
            `M ${x} ${y}`,
            `L ${x + width} ${y}`,
            `L ${nextX + nextWidth} ${y + sectionHeight}`,
            `L ${nextX} ${y + sectionHeight}`,
            'Z'
          ].join(' ');
          
          const colors = ['#fb923c', '#a855f7', '#ec4899', '#3b82f6'];
          
          return (
            <g key={index}>
              <path
                d={pathData}
                fill={colors[index % colors.length]}
                fillOpacity={isHovered ? 1 : 0.8}
                stroke={colors[index % colors.length]}
                strokeWidth="0.5"
                className="cursor-pointer transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  animationDelay: `${200 + index * 150}ms`,
                  animation: isVisible ? 'slideUp 0.8s ease-out' : 'none',
                  filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
                }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              />
              <text
                x="50"
                y={y + sectionHeight / 2}
                textAnchor="middle"
                className="text-xs fill-current text-foreground font-medium transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  animationDelay: `${500 + index * 150}ms`,
                  animation: isVisible ? 'slideUp 0.6s ease-out' : 'none'
                }}
              >
                {d.label}
              </text>
              <text
                x="50"
                y={y + sectionHeight / 2 + 12}
                textAnchor="middle"
                className="text-xs fill-current text-muted-2 transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  animationDelay: `${600 + index * 150}ms`,
                  animation: isVisible ? 'slideUp 0.6s ease-out' : 'none'
                }}
              >
                {d.value}
              </text>
              {isHovered && showTooltip && (
                <g>
                  <rect
                    x="75"
                    y={y + sectionHeight / 2 - 10}
                    width="60"
                    height="20"
                    fill="rgba(0,0,0,0.8)"
                    rx="3"
                    className="animate-slide-up"
                  />
                  <text
                    x="105"
                    y={y + sectionHeight / 2 + 3}
                    textAnchor="middle"
                    className="text-xs fill-white font-medium"
                  >
                    {((d.value / data[0].value) * 100).toFixed(1)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'funnel':
        return renderFunnelChart();
      default:
        return null;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover-glow-orange relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-soft/10 via-transparent to-purple-soft/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse-slow" />
          {title}
        </h3>
      </div>
      
      {/* Chart Container */}
      <div className="relative z-10">
        {renderChart()}
      </div>
      
      {/* Legend */}
      {showLegend && type === 'pie' && data && data.length > 0 && (
        <div className="relative z-10 mt-4 flex flex-wrap gap-2 justify-center">
          {data.map((item, index) => {
            const colors = ['#fb923c', '#a855f7', '#ec4899', '#3b82f6', '#22c55e'];
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-muted-2">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
