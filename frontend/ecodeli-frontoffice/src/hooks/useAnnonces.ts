/**
 * Hook pour la gestion des annonces
 * Centralise la logique de récupération, filtrage et gestion des annonces
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { Annonce, AnnonceFilters, CreateAnnonceData, ApiError } from '../types';

/**
 * Interface pour l'état du hook d'annonces
 */
interface UseAnnoncesReturn {
  // États des données
  annonces: Annonce[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAnnonces: (filters?: AnnonceFilters) => Promise<void>;
  createAnnonce: (data: CreateAnnonceData) => Promise<Annonce>;
  updateAnnonce: (id: number, data: Partial<CreateAnnonceData>) => Promise<Annonce>;
  deleteAnnonce: (id: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook personnalisé pour gérer les annonces
 * Fournit toutes les opérations CRUD et le filtrage des annonces
 */
export const useAnnonces = (): UseAnnoncesReturn => {
  // États du hook
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupération des annonces avec filtres optionnels
   */
  const fetchAnnonces = useCallback(async (filters?: AnnonceFilters): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Appel API avec filtres de recherche
      const response = await apiService.getAnnonces(filters);
      
      // Gestion du format de réponse avec typage
      const annoncesList = Array.isArray(response) ? response : (response as any)?.data || [];
      setAnnonces(annoncesList);
    } catch (error) {
      // Gestion des erreurs de récupération
      const apiError = error as ApiError;
      setError(apiError.message || 'Erreur lors du chargement des annonces');
      setAnnonces([]); // Réinitialisation en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Création d'une nouvelle annonce
   */
  const createAnnonce = useCallback(async (data: CreateAnnonceData): Promise<Annonce> => {
    setIsLoading(true);
    setError(null);

    try {
      // Appel API pour créer l'annonce
      const newAnnonce = await apiService.createAnnonce(data) as Annonce;
      
      // Ajout de la nouvelle annonce à la liste locale
      setAnnonces(prev => [newAnnonce, ...prev]);
      
      return newAnnonce;
    } catch (error) {
      // Gestion des erreurs de création
      const apiError = error as ApiError;
      setError(apiError.message || 'Erreur lors de la création de l\'annonce');
      throw error; // Re-throw pour permettre la gestion dans le composant
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mise à jour d'une annonce existante
   */
  const updateAnnonce = useCallback(async (id: number, data: Partial<CreateAnnonceData>): Promise<Annonce> => {
    setIsLoading(true);
    setError(null);

    try {
      // Appel API pour modifier l'annonce
      const updatedAnnonce = await apiService.updateAnnonce(id, data) as Annonce;
      
      // Mise à jour de l'annonce dans la liste locale
      setAnnonces(prev => 
        prev.map(annonce => 
          annonce.id === id ? updatedAnnonce : annonce
        )
      );
      
      return updatedAnnonce;
    } catch (error) {
      // Gestion des erreurs de modification
      const apiError = error as ApiError;
      setError(apiError.message || 'Erreur lors de la modification de l\'annonce');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Suppression d'une annonce
   */
  const deleteAnnonce = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Appel API pour supprimer l'annonce
      await apiService.deleteAnnonce(id);
      
      // Suppression de l'annonce de la liste locale
      setAnnonces(prev => prev.filter(annonce => annonce.id !== id));
    } catch (error) {
      // Gestion des erreurs de suppression
      const apiError = error as ApiError;
      setError(apiError.message || 'Erreur lors de la suppression de l\'annonce');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Effacement des erreurs
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Chargement initial des annonces
  useEffect(() => {
    fetchAnnonces();
  }, [fetchAnnonces]);

  // Interface publique du hook
  return {
    // États
    annonces,
    isLoading,
    error,
    
    // Actions
    fetchAnnonces,
    createAnnonce,
    updateAnnonce,
    deleteAnnonce,
    clearError
  };
};

/**
 * Hook spécialisé pour les annonces d'un utilisateur spécifique
 */
export const useUserAnnonces = () => {
  const [userAnnonces, setUserAnnonces] = useState<Annonce[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupération des annonces de l'utilisateur connecté
   */
  const fetchUserAnnonces = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Appel API spécifique aux annonces de l'utilisateur
      const response = await apiService.getUserAnnonces();
      const annoncesList = Array.isArray(response) ? response : (response as any)?.data || [];
      setUserAnnonces(annoncesList);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Erreur lors du chargement de vos annonces');
      setUserAnnonces([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    fetchUserAnnonces();
  }, [fetchUserAnnonces]);

  return {
    userAnnonces,
    isLoading,
    error,
    fetchUserAnnonces,
    clearError: () => setError(null)
  };
};

/**
 * Hook pour filtrer les annonces côté client
 * Utile pour le filtrage en temps réel sans appels API
 */
export const useAnnonceFilters = (annonces: Annonce[]) => {
  const [filters, setFilters] = useState<AnnonceFilters>({});

  /**
   * Application des filtres sur la liste d'annonces
   */
  const filteredAnnonces = useCallback((): Annonce[] => {
    return annonces.filter(annonce => {
      // Filtre par recherche textuelle
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = annonce.titre.toLowerCase().includes(searchLower);
        const matchesDescription = annonce.description.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Filtre par type de livraison
      if (filters.typelivraison && annonce.typelivraison !== filters.typelivraison) {
        return false;
      }

      // Filtre par prix minimum
      if (filters.prixMin && annonce.prix < filters.prixMin) {
        return false;
      }

      // Filtre par prix maximum
      if (filters.prixMax && annonce.prix > filters.prixMax) {
        return false;
      }

      // Filtre par ville (extraction de l'adresse)
      if (filters.ville) {
        const villeLower = filters.ville.toLowerCase();
        const adresseIncludes = annonce.adresseLivraison.toLowerCase().includes(villeLower) ||
                              annonce.adresseEnlevement.toLowerCase().includes(villeLower);
        if (!adresseIncludes) return false;
      }

      return true;
    });
  }, [annonces, filters]);

  /**
   * Mise à jour d'un filtre spécifique
   */
  const updateFilter = useCallback((key: keyof AnnonceFilters, value: any): void => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * Réinitialisation de tous les filtres
   */
  const clearFilters = useCallback((): void => {
    setFilters({});
  }, []);

  return {
    filters,
    filteredAnnonces: filteredAnnonces(),
    updateFilter,
    clearFilters
  };
};

// Export par défaut
export default useAnnonces;
