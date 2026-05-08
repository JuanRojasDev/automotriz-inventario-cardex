import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  closable = true,
  icon: CustomIcon,
  className = '',
}) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = CustomIcon || icons[type];

  const styles = {
    success: isDark
      ? 'bg-emerald-900/30 border-emerald-800/50 text-emerald-300'
      : 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: isDark
      ? 'bg-red-900/30 border-red-800/50 text-red-300'
      : 'bg-red-50 border-red-200 text-red-900',
    warning: isDark
      ? 'bg-amber-900/30 border-amber-800/50 text-amber-300'
      : 'bg-amber-50 border-amber-200 text-amber-900',
    info: isDark
      ? 'bg-blue-900/30 border-blue-800/50 text-blue-300'
      : 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <div className={`border rounded-xl p-4 flex gap-4 ${styles[type]} ${className} transition-all`}>
      <Icon size={20} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h3 className="font-bold text-sm mb-1">{title}</h3>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      {closable && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={18} strokeWidth={2} />
        </button>
      )}
    </div>
  );
};

export default Alert;
