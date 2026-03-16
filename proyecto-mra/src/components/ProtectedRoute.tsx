import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type ProtectedRouteProps = {
  redirectTo?: string;
  isPublic?: boolean; // true = solo accesible si NO está logueado (ej: login, register)
};

const ProtectedRoute = ({ redirectTo = '/login', isPublic = false }: ProtectedRouteProps) => {
  const { user } = useAuth();

  // Caso 1: Ruta pública (solo para no logueados)
  if (isPublic) {
    if (user) {
      // Si ya está logueado, redirigir a home o perfil
      return <Navigate to={redirectTo} replace />;
    }
    return <Outlet />;
  }

  // Caso 2: Ruta protegida (solo para logueados)
  if (!user) {
    // No está logueado → redirigir a login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;