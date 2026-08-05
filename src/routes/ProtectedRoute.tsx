import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  // Si se indica, además de estar autenticado el usuario debe tener ese rol
  // (comparado contra roles con prefijo "ROLE_", igual que en el backend).
  requireRole?: 'ROLE_ADMIN';
}

export function ProtectedRoute({ requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // "state" guarda de dónde venía el usuario para poder volver tras el login.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRole && !user?.roles.includes(requireRole)) {
    return <Navigate to="/employees" replace />;
  }

  return <Outlet />;
}
