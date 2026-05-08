import { useTheme } from '../../context/ThemeContext';

const Card = ({ children, className = '', variant = 'default' }) => {
  const { theme, isDark } = useTheme();

  const variants = {
    default: `${theme.bg} ${theme.border} border shadow-sm hover:shadow-md`,
    elevated: `${theme.bg} ${theme.border} border shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl`,
    ghost: `${isDark ? 'bg-white/5' : 'bg-black/2'} border-0`,
  };

  return (
    <div className={`rounded-2xl transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
