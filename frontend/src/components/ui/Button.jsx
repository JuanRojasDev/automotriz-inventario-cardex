import { useTheme } from '../../context/ThemeContext';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) => {
  const { isDark, roleColors } = useTheme();

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variants = {
    primary: `bg-gradient-to-r ${roleColors.primary} text-white hover:shadow-lg disabled:opacity-50`,
    secondary: isDark
      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50'
      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50',
    ghost: isDark
      ? 'text-slate-300 hover:bg-white/10 disabled:opacity-50'
      : 'text-slate-700 hover:bg-black/5 disabled:opacity-50',
    outline: isDark
      ? 'border border-slate-600 text-slate-300 hover:bg-white/5 disabled:opacity-50'
      : 'border border-slate-300 text-slate-700 hover:bg-black/2 disabled:opacity-50',
  };

  return (
    <button
      className={`
        font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2
        ${sizes[size]} ${variants[variant]} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={18} strokeWidth={2} />}
      {children}
    </button>
  );
};

export default Button;
