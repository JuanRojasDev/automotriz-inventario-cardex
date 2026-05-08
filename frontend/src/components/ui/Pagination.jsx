import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Pagination = ({ pagina, totalPaginas, onCambiar }) => {
  const { isDark, theme, roleColors } = useTheme();

  if (totalPaginas <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= pagina - 1 && i <= pagina + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const buttonBase = `p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} disabled:opacity-40 disabled:cursor-not-allowed`;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button
        onClick={() => onCambiar(pagina - 1)}
        disabled={pagina === 1}
        className={`${buttonBase} ${theme.border} border ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
        aria-label="Página anterior"
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={i} className={`px-2 ${theme.textSecondary} text-sm`}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onCambiar(p)}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
              p === pagina
                ? `bg-gradient-to-r ${roleColors.primary} text-white shadow-lg`
                : `${theme.border} border ${theme.textSecondary} hover:shadow-sm`
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina === totalPaginas}
        className={`${buttonBase} ${theme.border} border ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
        aria-label="Siguiente página"
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>
    </div>
  );
};

export default Pagination;
