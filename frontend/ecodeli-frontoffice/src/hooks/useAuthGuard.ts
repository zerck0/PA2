import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export const useAuthGuard = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = (action: () => void, redirectPath?: string) => {
    if (!isAuthenticated) {
      // Sauvegarder l'intention de l'utilisateur
      const intendedPath = redirectPath || location.pathname;
      localStorage.setItem('redirectAfterLogin', intendedPath);
      navigate('/login', { 
        state: { 
          from: intendedPath,
          message: 'Vous devez être connecté pour accéder à cette fonctionnalité'
        }
      });
      return;
    }
    action();
  };

  const requireAuthForPath = (path: string) => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', path);
      navigate('/login', { 
        state: { 
          from: path,
          message: 'Connectez-vous pour accéder à cette page'
        }
      });
      return false;
    }
    return true;
  };

  return { 
    requireAuth, 
    requireAuthForPath, 
    isAuthenticated 
  };
};
