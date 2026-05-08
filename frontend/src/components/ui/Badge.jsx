import { useTheme } from '../../context/ThemeContext';

const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  const { isDark, roleColors } = useTheme();

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variants = {
    primary: `bg-gradient-to-r ${roleColors.primary} text-white`,
    secondary: isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-900',
    success: isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
    warning: isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700',
    danger: isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700',
    info: isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`font-semibold rounded-full inline-block transition-all ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
