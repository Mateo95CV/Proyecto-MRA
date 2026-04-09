// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface Props {
  isPublic?:     boolean;   // true = solo para NO autenticados (login/register)
  requiredRole?: 'admin' | 'user';
  redirectTo?:   string;
}

const ProtectedRoute = ({ isPublic = false, requiredRole, redirectTo = '/login' }: Props) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-purple" />
      </div>
    );
  }

  // Rutas públicas (login/register): redirigir si ya hay sesión
  if (isPublic) {
    return user ? <Navigate to={redirectTo} replace /> : <Outlet />;
  }

  // Sin sesión → al login
  if (!user) return <Navigate to="/login" replace />;

  // Requiere rol específico
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
