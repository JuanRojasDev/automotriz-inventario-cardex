import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/productos': 'Gestión de Productos',
  '/movimientos': 'Registro de Movimientos',
  '/kardex': 'Kardex / Historial',
  '/reportes': 'Reportes',
  '/usuarios': 'Gestión de Usuarios',
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Inventario';
  const { theme, isDark } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${theme.bgSecondary} dark:transition-colors duration-200`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
