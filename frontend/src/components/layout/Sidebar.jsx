import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowLeftRight, BookOpen,
  BarChart3, Users, X, Boxes, Shield, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/productos',   label: 'Productos',     Icon: Package },
  { to: '/movimientos', label: 'Movimientos',   Icon: ArrowLeftRight },
  { to: '/kardex',      label: 'Kardex',        Icon: BookOpen },
  { to: '/reportes',    label: 'Reportes',      Icon: BarChart3 },
];

const adminItems = [
  { to: '/usuarios', label: 'Usuarios', Icon: Users },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { usuario, esAdmin } = useAuth();
  const { isDark, roleColors, isAdmin, isViewer, theme } = useTheme();

  const sidebarBg = isAdmin
    ? isDark ? 'from-amber-950 via-slate-900 to-yellow-900' : 'from-amber-50 via-white to-yellow-50'
    : isViewer
    ? isDark ? 'from-emerald-950 via-slate-900 to-green-900' : 'from-emerald-50 via-white to-green-50'
    : isDark ? 'from-blue-950 via-slate-900 to-blue-900' : 'from-blue-50 via-white to-blue-50';

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const navHover = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-gradient-to-b ${sidebarBg}
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        shadow-xl dark:shadow-2xl
      `}>

        {/* Logo */}
        <div className={`flex items-center justify-between px-5 py-5 ${borderColor} border-b`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors.primary} flex items-center justify-center shadow-lg`}>
              <Boxes size={20} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className={`${textPrimary} font-bold text-base leading-tight tracking-wide`}>AOA</p>
              <p className={`${roleColors.primaryText} text-xs font-medium`}>Inventario & Kardex</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg ${textSecondary} hover:${theme.text} ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} transition-all`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Usuario */}
        <div className={`px-5 py-4 ${borderColor} border-b`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleColors.primary}
                            flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className={`${textPrimary} text-sm font-semibold truncate`}>{usuario?.nombre}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {isAdmin ? (
                  <>
                    <Shield size={12} className="text-amber-500" />
                    <span className="text-xs text-amber-500 font-semibold">Administrador</span>
                  </>
                ) : isViewer ? (
                  <>
                    <Zap size={12} className="text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-semibold">Viewer</span>
                  </>
                ) : (
                  <>
                    <Zap size={12} className="text-blue-500" />
                    <span className="text-xs text-blue-500 font-semibold">Operador</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${roleColors.primary} text-white shadow-lg font-semibold`
                    : `${textSecondary} ${navHover} font-medium`
                }`
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{label}</span>
            </NavLink>
          ))}

          {esAdmin() && (
            <>
              <div className={`pt-5 pb-2 px-4`}>
                <p className={`text-xs font-bold ${roleColors.primaryText} uppercase tracking-widest opacity-75`}>
                  Administración
                </p>
              </div>
              {adminItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${roleColors.primary} text-white shadow-lg font-semibold`
                        : `${textSecondary} ${navHover} font-medium`
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className={`px-5 py-4 ${borderColor} border-t`}>
          <p className={`text-xs ${textSecondary} text-center opacity-75`}>
            © 2025 AOA · Se Mueve Contigo
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
