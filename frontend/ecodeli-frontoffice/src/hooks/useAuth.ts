/**
 * Hook principal pour la gestion de l'authentification
 * Centralise toute la logique d'auth : connexion, déconnexion, vérification token
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { User, AuthResponse, RegisterData, ApiError } from '../types';

/**
 * Interface pour l'état du hook d'authentification
 */
interface UseAuthReturn {
  // États
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Hook personnalisé pour gérer l'authentification utilisateur
 * Utilise le service API centralisé et gère les états de chargement/erreur
 */
export const useAuth = (): UseAuthReturn => {
  // États du hook
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  /**
   * Initialisation - Vérification d'un utilisateur déjà connecté au chargement
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Vérification de l'authentification existante au chargement de l'app
   */
  const initializeAuth = async (): Promise<void> => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Vérification de la validité du token avec l'API
        await apiService.verifyToken();
        
        // Token valide - restauration de l'utilisateur
        const user: User = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        // Token invalide - nettoyage
        handleLogout();
      }
    }
  };

  /**
   * Connexion utilisateur avec email et mot de passe
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Appel API pour l'authentification - typage explicite
      const response = await apiService.login(email, password) as AuthResponse;

      // Stockage sécurisé du token et des données utilisateur
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Mise à jour de l'état global
      setCurrentUser(response.user);

      // Redirection vers la page demandée ou dashboard par défaut
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);

    } catch (error) {
      // Gestion des erreurs de connexion
      const apiError = error as ApiError;
      setError(apiError.message || 'Erreur lors de la connexion');
      throw error; // Re-throw pour permettre la gestion dans le composant
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = useCallback(async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Appel API pour l'inscription - typage explicite
      const response = await apiService.register(userData) as AuthResponse;

      // Stockage automatique après inscription réussie
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Mise à jour de l'état
      setCurrentUser(response.user);

      // Redirection vers le dashboard
      navigate('/dashboard');

    } catch (error) {
      // Gestion des erreurs d'inscription
      const apiError = error as ApiError;
      setError(apiError.message || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Déconnexion de l'utilisateur
   */
  const logout = useCallback((): void => {
    handleLogout();
    navigate('/');
  }, [navigate]);

  /**
   * Logique interne de déconnexion (nettoyage des données)
   */
  const handleLogout = (): void => {
    // Appel API de déconnexion (optionnel)
    apiService.logout().catch(console.warn);

    // Nettoyage de l'état local
    setCurrentUser(null);
    setError(null);

    // Nettoyage du stockage local (fait aussi dans apiService)
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  /**
   * Effacement manuel des erreurs
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Interface publique du hook
  return {
    // États
    currentUser,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    clearError
  };
};

/**
 * Hook utilitaire pour vérifier si un utilisateur est connecté
 */
export const useIsAuthenticated = (): boolean => {
  const { currentUser } = useAuth();
  return currentUser !== null;
};

/**
 * Hook utilitaire pour vérifier le rôle de l'utilisateur connecté
 */
export const useUserRole = (): string | null => {
  const { currentUser } = useAuth();
  return currentUser?.role || null;
};

/**
 * Hook utilitaire pour vérifier si l'utilisateur a un rôle spécifique
 */
export const useHasRole = (requiredRole: string): boolean => {
  const userRole = useUserRole();
  return userRole === requiredRole;
};

/**
 * Hook utilitaire pour vérifier si l'utilisateur a au moins un des rôles requis
 */
export const useHasAnyRole = (requiredRoles: string[]): boolean => {
  const userRole = useUserRole();
  return userRole ? requiredRoles.includes(userRole) : false;
};

// Export par défaut du hook principal
export default useAuth;
