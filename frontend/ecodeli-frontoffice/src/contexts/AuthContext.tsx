import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import { AuthResponse } from '../types';

interface AuthContextType {
  currentUser: AuthResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté au démarrage
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response));
      
      setCurrentUser(response);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await authApi.register(userData);
      
      // Stocker le token et les données utilisateur si la réponse contient un token
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response));
        setCurrentUser(response);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await authApi.getProfile();
      
      // Créer la nouvelle structure AuthResponse avec les données rafraîchies
      const refreshedAuthResponse: AuthResponse = {
        token: currentUser.token, // Garder le même token
        user: userData // Utiliser les nouvelles données utilisateur
      };
      
      // Mettre à jour le localStorage et l'état
      localStorage.setItem('currentUser', JSON.stringify(refreshedAuthResponse));
      setCurrentUser(refreshedAuthResponse);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      // En cas d'erreur, on pourrait décider de déconnecter l'utilisateur
      // logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    refreshCurrentUser,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
