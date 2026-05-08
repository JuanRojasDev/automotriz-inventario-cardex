import { useTheme } from '../../context/ThemeContext';

const Spinner = ({ size = 'md', className = '' }) => {
  const { roleColors, isDark } = useTheme();
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-7 w-7 border-2',
    lg: 'h-11 w-11 border-[3px]'
  };

  const primaryColor = roleColors.primary.includes('blue') ? 'border-t-blue-600' : 'border-t-emerald-600';
  const borderBg = isDark ? 'border-slate-700' : 'border-slate-200';

  return (
    <div
      className={`animate-spin rounded-full ${borderBg} ${primaryColor} ${sizes[size]} ${className}`}
    />
  );
};

export const SpinnerPage = () => {
  const { theme, isDark } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen gap-4 ${theme.bgSecondary} transition-colors`}>
      <Spinner size="lg" />
      <p className={`text-base font-semibold ${theme.textSecondary}`}>Cargando...</p>
    </div>
  );
};

export default Spinner;
