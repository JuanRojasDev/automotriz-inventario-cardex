import { useTheme } from '../../context/ThemeContext';

const Input = ({
  label,
  error,
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) => {
  const { isDark, theme } = useTheme();

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className={`text-sm font-semibold ${theme.text}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-3 top-3 ${theme.textSecondary}`}>
            <Icon size={18} strokeWidth={1.5} />
          </div>
        )}
        <input
          className={`
            w-full ${Icon ? 'pl-10' : 'px-4'} py-2.5 rounded-lg
            ${theme.bg} ${theme.border} border ${theme.text}
            ${isDark
              ? 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500'
              : 'focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
            }
            transition-all duration-200
            placeholder:${theme.textSecondary}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? isDark ? 'border-red-500/50 focus:border-red-500' : 'border-red-300' : ''}
            ${className}
          `}
          disabled={disabled}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
