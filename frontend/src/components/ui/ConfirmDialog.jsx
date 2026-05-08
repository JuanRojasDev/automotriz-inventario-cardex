import { AlertTriangle, Info } from 'lucide-react';
import Modal from './Modal';
import { useTheme } from '../../context/ThemeContext';

const ConfirmDialog = ({
  isOpen, onClose, onConfirm,
  title, message,
  confirmText = 'Confirmar',
  danger = false,
}) => {
  const { isDark, theme } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
          ${danger
            ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'
            : isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'
          }`}>
          {danger ? <AlertTriangle size={24} /> : <Info size={24} />}
        </div>
        <p className={`text-base ${theme.text} leading-relaxed pt-1`}>{message}</p>
      </div>
      <div className="flex gap-3 justify-end mt-7">
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isDark
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Cancelar
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-all ${
            danger
              ? 'bg-red-600 hover:bg-red-700 dark:hover:bg-red-500'
              : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
