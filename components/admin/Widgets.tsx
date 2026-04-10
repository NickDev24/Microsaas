'use client';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function Widget({ title, children, className = '' }: WidgetProps) {
  return (
    <div className={`bg-surface border border-border rounded-xl p-4 hover-glow-orange ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface ThermometerWidgetProps {
  current: number;
  target: number;
  label: string;
}

export function ThermometerWidget({ current, target, label }: ThermometerWidgetProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const angle = (percentage * 180) / 100 - 90;
  const radians = (angle * Math.PI) / 180;
  const x2 = 50 + 35 * Math.cos(radians);
  const y2 = 50 + 35 * Math.sin(radians);

  return (
    <Widget title={label}>
      <svg width="100%" height="120" viewBox="0 0 100 100" className="w-full">
        <defs>
          <linearGradient id="thermometerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-2"
        />
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="url(#thermometerGradient)"
          strokeWidth="8"
          strokeDasharray={`${percentage * 109.96} 109.96`}
          className="transition-all duration-500"
        />
        <circle cx={x2} cy={y2} r="4" fill="#fb923c" />
        
        <text x="50" y="75" textAnchor="middle" className="text-lg font-bold fill-current text-foreground">
          {current}/{target}
        </text>
        <text x="50" y="90" textAnchor="middle" className="text-xs fill-current text-muted-2">
          {percentage.toFixed(0)}% completado
        </text>
      </svg>
    </Widget>
  );
}

interface DeviceStatsProps {
  mobile: number;
  desktop: number;
  tablet: number;
}

export function DeviceStatsWidget({ mobile, desktop, tablet }: DeviceStatsProps) {
  const total = mobile + desktop + tablet;
  const mobileAngle = (mobile / total) * 360;
  const desktopAngle = (desktop / total) * 360;
  const tabletAngle = (tablet / total) * 360;

  return (
    <Widget title="Dispositivos">
      <svg width="100%" height="120" viewBox="0 0 100 100" className="w-full">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="20" className="text-surface-2" />
        
        {/* Mobile segment */}
        <circle
          cx="50" cy="50" r="30"
          fill="none"
          stroke="#fb923c"
          strokeWidth="20"
          strokeDasharray={`${mobileAngle * 0.524} 188.5`}
          strokeDashoffset="0"
          transform="rotate(-90 50 50)"
        />
        
        {/* Desktop segment */}
        <circle
          cx="50" cy="50" r="30"
          fill="none"
          stroke="#a855f7"
          strokeWidth="20"
          strokeDasharray={`${desktopAngle * 0.524} 188.5`}
          strokeDashoffset={`-${mobileAngle * 0.524}`}
          transform="rotate(-90 50 50)"
        />
        
        {/* Tablet segment */}
        <circle
          cx="50" cy="50" r="30"
          fill="none"
          stroke="#ec4899"
          strokeWidth="20"
          strokeDasharray={`${tabletAngle * 0.524} 188.5`}
          strokeDashoffset={`-${(mobileAngle + desktopAngle) * 0.524}`}
          transform="rotate(-90 50 50)"
        />
        
        <text x="50" y="50" textAnchor="middle" className="text-lg font-bold fill-current text-foreground">
          {total}
        </text>
        <text x="50" y="65" textAnchor="middle" className="text-xs fill-current text-muted-2">
          usuarios
        </text>
      </svg>
      
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-muted-2">Mobile</span>
          </div>
          <span className="text-foreground font-medium">{mobile}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-muted-2">Desktop</span>
          </div>
          <span className="text-foreground font-medium">{desktop}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-muted-2">Tablet</span>
          </div>
          <span className="text-foreground font-medium">{tablet}</span>
        </div>
      </div>
    </Widget>
  );
}

interface KeywordsWidgetProps {
  keywords: string[];
}

export function KeywordsWidget({ keywords }: KeywordsWidgetProps) {
  return (
    <Widget title="Top Keywords">
      <div className="space-y-2">
        {keywords.map((keyword, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors">
            <span className="text-sm text-foreground truncate flex-1">{keyword}</span>
            <span className="text-xs text-muted-2 ml-2">#{index + 1}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

interface CategoriesWidgetProps {
  categories: Array<{ name: string; sales: number }>;
}

export function CategoriesWidget({ categories }: CategoriesWidgetProps) {
  const maxSales = Math.max(...categories.map(c => c.sales));

  return (
    <Widget title="Categorías Más Vendidas">
      <div className="space-y-3">
        {categories.map((category, index) => {
          const percentage = (category.sales / maxSales) * 100;
          const colors = ['bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500'];
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate">{category.name}</span>
                <span className="text-muted-2">{category.sales}</span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </Widget>
  );
}

interface ActivityWidgetProps {
  activities: Array<{ type: string; message: string; time: string }>;
}

export function ActivityWidget({ activities }: ActivityWidgetProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰';
      case 'product': return '👕';
      case 'stock': return '⚠️';
      default: return '📊';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-500';
      case 'product': return 'text-blue-500';
      case 'stock': return 'text-red-500';
      default: return 'text-muted-2';
    }
  };

  return (
    <Widget title="Actividad en Tiempo Real">
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors">
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-2">{activity.time}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} animate-pulse`}></div>
          </div>
        ))}
      </div>
    </Widget>
  );
}
