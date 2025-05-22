import { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ requiredRoles = [] }: { requiredRoles?: string[] }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="text-center py-5">Chargement...</div>;
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si des rôles spécifiques sont requis et que l'utilisateur n'a pas le bon rôle
  if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si l'utilisateur est authentifié et a les bons droits, afficher la route enfant
  return <Outlet />;
};

export default ProtectedRoute;