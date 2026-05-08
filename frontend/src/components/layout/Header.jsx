import { Menu, LogOut, Moon, Sun, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick, title }) => {
  const { usuario, logout } = useAuth();
  const { isDark, toggleTheme, roleColors, isAdmin, isViewer, theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  return (
    <header className={`${theme.bg} ${theme.border} border-b px-4 md:px-6 py-4
                       flex items-center justify-between sticky top-0 z-10 shadow-md
                       dark:shadow-lg transition-all duration-200`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-lg transition-colors ${theme.hover}`}
          aria-label="Abrir menú"
        >
          <Menu size={20} className={theme.text} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-lg font-bold ${theme.text} leading-tight`}>{title}</h1>
            {isAdmin && (
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${roleColors.primaryLight} ${roleColors.primaryText}`}>
                Admin
              </span>
            )}
          </div>
          <p className={`text-xs ${theme.textSecondary} hidden sm:block mt-0.5`}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Tema oscuro/claro */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-all ${theme.hover}`}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDark ? (
            <Sun size={19} className="text-amber-500" />
          ) : (
            <Moon size={19} className={theme.textSecondary} />
          )}
        </button>

        {/* Nombre, rol y avatar */}
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className={`text-sm font-semibold ${theme.text}`}>{usuario?.nombre}</span>
          <span className={`text-xs ${theme.textSecondary} capitalize flex items-center gap-1 mt-0.5`}>
            {isAdmin ? (
              <>
                <Shield size={14} className="text-amber-500" />
                Administrador
              </>
            ) : isViewer ? (
              <>
                <Users size={14} className="text-emerald-500" />
                Viewer
              </>
            ) : (
              <>
                <Users size={14} className="text-blue-500" />
                Operador
              </>
            )}
          </span>
        </div>

        {/* Avatar */}
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleColors.primary} flex items-center justify-center
                        text-white font-bold text-sm shadow-lg`}>
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`p-2 rounded-lg transition-all ${theme.hover} text-red-500 hover:text-red-600 dark:hover:text-red-400`}
          title="Cerrar sesión"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
};

export default Header;
