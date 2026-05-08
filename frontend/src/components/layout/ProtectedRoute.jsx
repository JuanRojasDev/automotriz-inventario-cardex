import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SpinnerPage } from '../ui/Spinner';

const ProtectedRoute = ({ children, requiereAdmin = false }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) return <SpinnerPage />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (requiereAdmin && usuario.rol !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
