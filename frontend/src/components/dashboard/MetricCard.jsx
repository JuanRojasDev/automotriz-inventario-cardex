import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', alert = false, trend }) => {
  const { isDark, theme } = useTheme();

  const palettes = {
    light: {
      blue:   { bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50',    text: isDark ? 'text-blue-400' : 'text-blue-600',    ring: isDark ? 'ring-blue-800/50' : 'ring-blue-100' },
      green:  { bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50', text: isDark ? 'text-emerald-400' : 'text-emerald-600', ring: isDark ? 'ring-emerald-800/50' : 'ring-emerald-100' },
      yellow: { bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50',   text: isDark ? 'text-amber-400' : 'text-amber-600',   ring: isDark ? 'ring-amber-800/50' : 'ring-amber-100' },
      red:    { bg: isDark ? 'bg-red-900/30' : 'bg-red-50',    text: isDark ? 'text-red-400' : 'text-red-600',    ring: isDark ? 'ring-red-800/50' : 'ring-red-100' },
      purple: { bg: isDark ? 'bg-violet-900/30' : 'bg-violet-50',  text: isDark ? 'text-violet-400' : 'text-violet-600',  ring: isDark ? 'ring-violet-800/50' : 'ring-violet-100' },
    }
  };

  const p = palettes.light[color] || palettes.light.blue;

  return (
    <div className={`
      ${theme.bg} ${theme.border} border rounded-2xl p-6
      shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl
      transition-all duration-300
      ${alert ? isDark ? 'bg-amber-900/20 border-amber-800/50' : 'border-amber-200 bg-amber-50/40' : ''}
    `}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-widest mb-2`}>
            {title}
          </p>
          <p className={`text-3xl font-bold leading-tight truncate
            ${alert ? isDark ? 'text-amber-300' : 'text-amber-700' : theme.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm ${theme.textSecondary} mt-1.5`}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-3 text-sm font-semibold
              ${trend >= 0 
                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                : isDark ? 'text-red-400' : 'text-red-500'
              }`}>
              {trend >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {Math.abs(trend)}% vs ayer
            </div>
          )}
        </div>
        {Icon && (
          <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
            ring-1 ${p.bg} ${p.ring} transition-all duration-200`}>
            <Icon size={28} className={p.text} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
