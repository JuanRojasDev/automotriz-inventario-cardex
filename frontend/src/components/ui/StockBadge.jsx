import { useTheme } from '../../context/ThemeContext';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const StockBadge = ({ stockActual, stockMinimo }) => {
  const { isDark } = useTheme();
  const ratio = stockMinimo > 0 ? stockActual / stockMinimo : 1;

  const getStyle = () => {
    if (stockActual === 0) {
      return {
        icon: AlertCircle,
        label: 'Sin stock',
        styles: isDark ? 'bg-red-900/30 text-red-300 border border-red-800/50' : 'bg-red-50 text-red-700 border border-red-200'
      };
    }
    if (ratio <= 1) {
      return {
        icon: AlertTriangle,
        label: `Bajo · ${stockActual}`,
        styles: isDark ? 'bg-amber-900/30 text-amber-300 border border-amber-800/50' : 'bg-amber-50 text-amber-700 border border-amber-200'
      };
    }
    if (ratio <= 2) {
      return {
        icon: Info,
        label: `Medio · ${stockActual}`,
        styles: isDark ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' : 'bg-blue-50 text-blue-700 border border-blue-200'
      };
    }
    return {
      icon: CheckCircle,
      label: `OK · ${stockActual}`,
      styles: isDark ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    };
  };

  const { icon: Icon, label, styles } = getStyle();

  return (
    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${styles} transition-all`}>
      <Icon size={16} strokeWidth={2} />
      {label}
    </span>
  );
};

export default StockBadge;
