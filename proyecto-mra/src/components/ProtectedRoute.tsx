import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type ProtectedRouteProps = {
  /**
   * Ruta a la que redirigir si no tiene acceso
   * @default "/login"
   */
  redirectTo?: string;

  /**
   * Si es true, esta ruta solo es accesible si NO está logueado
   * Ej: login, register
   */
  isPublic?: boolean;

  /**
   * Si se especifica, la ruta solo es accesible para usuarios con este rol
   * Ej: 'admin' para panel de administración
   */
  requiredRole?: 'admin' | 'user';
};

const ProtectedRoute = ({
  redirectTo = '/login',
  isPublic = false,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user } = useAuth();

  // Caso 1: Rutas públicas (solo accesibles si NO está logueado)
  if (isPublic) {
    if (user) {
      // Si ya está logueado, redirigir según su rol
      const destination = user.role === 'admin' ? '/admin' : '/';
      return <Navigate to={destination} replace />;
    }
    // No está logueado → permitir acceso
    return <Outlet />;
  }

  // Caso 2: Rutas protegidas (requieren estar logueado)
  if (!user) {
    // No autenticado → redirigir a login
    return <Navigate to="/login" replace />;
  }

  // Caso 3: Verificar rol requerido (si se especificó)
  if (requiredRole && user.role !== requiredRole) {
    // No tiene el rol necesario → redirigir a home o dashboard según rol
    const fallback = user.role === 'admin' ? '/admin' : '/';
    return <Navigate to={fallback} replace />;
  }

  // Todo OK → mostrar la ruta
  return <Outlet />;
};

export default ProtectedRoute;