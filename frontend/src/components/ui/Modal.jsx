import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { isDark, theme } = useTheme();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-slate-900/50'} backdrop-blur-sm transition-all`}
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`
        relative ${theme.bg} rounded-2xl shadow-2xl dark:shadow-2xl w-full ${sizes[size]}
        max-h-[90vh] overflow-y-auto
        animate-in fade-in zoom-in-95 duration-200
        ${theme.border} border
      `}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 ${theme.border} border-b`}>
          <h2 className={`text-lg font-bold ${theme.text}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textSecondary} hover:${theme.text} ${theme.hover} transition-all`}
          >
            <X size={20} />
          </button>
        </div>
        <div className={`px-6 py-5 ${theme.text}`}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
