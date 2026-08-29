import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protege uma rota.
 * - Se não estiver logado, redireciona para /login (guardando a origem).
 * - Se `adminOnly` for true e o usuário não for admin, redireciona para a home.
 * - Se `requireAuth` for true e estiver logado, redireciona para a home (ex.: mostrar /login já logado).
 */
export default function ProtectedRoute({
  children,
  adminOnly = false,
  operatorOnly = false,
  publicOnly = false,
}) {
  const { isAuthenticated, isAdmin, isOperator, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-4 text-muted">Carregando...</div>;
  }

  // Rota para visitantes (ex.: /login quando já logado)
  if (publicOnly && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Rota autenticada
  if (!publicOnly && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rota de admin
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Rota de operator (admin também passa)
  if (operatorOnly && !isOperator()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
