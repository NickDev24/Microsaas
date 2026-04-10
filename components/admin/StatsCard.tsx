export function StatsCard({ title, value, icon, description, trend }: { 
  title: string; 
  value: string | number; 
  icon: string; 
  description?: string;
  trend?: { value: number; isUp: boolean };
}) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <h3 className="text-muted text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
      </div>
      {description && <p className="text-xs text-muted-2 mt-2">{description}</p>}
    </div>
  );
}
