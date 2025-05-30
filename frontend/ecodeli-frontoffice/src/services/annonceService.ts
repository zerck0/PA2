import axios from 'axios';
import { Annonce, CreateAnnonceDTO, AnnonceFilters } from '../types/annonce';

const API_BASE_URL = 'http://localhost:8080/api';

// Créer une instance axios avec configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const annonceService = {
  // Récupérer toutes les annonces
  getAllAnnonces: async (): Promise<Annonce[]> => {
    try {
      const response = await api.get('/annonces');
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des annonces:', error);
      throw new Error('Impossible de récupérer les annonces');
    }
  },

  // Rechercher des annonces avec filtres
  searchAnnonces: async (filters: AnnonceFilters): Promise<Annonce[]> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.ville) {
        params.append('ville', filters.ville);
      }
      if (filters.type) {
        params.append('type', filters.type);
      }

      const response = await api.get(`/annonces/search?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la recherche d\'annonces:', error);
      throw new Error('Impossible de rechercher les annonces');
    }
  },

  // Créer une nouvelle annonce
  createAnnonce: async (annonce: CreateAnnonceDTO, auteurId: number): Promise<Annonce> => {
    try {
      const response = await api.post(`/annonces?auteurId=${auteurId}`, annonce);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de créer l\'annonce');
    }
  },

  // Récupérer une annonce par ID
  getAnnonceById: async (id: number): Promise<Annonce> => {
    try {
      const response = await api.get(`/annonces/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'annonce:', error);
      throw new Error('Impossible de récupérer l\'annonce');
    }
  },

  // Récupérer les annonces d'un utilisateur
  getMyAnnonces: async (userId: number): Promise<Annonce[]> => {
    try {
      const response = await api.get(`/annonces/mes-annonces/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des annonces utilisateur:', error);
      throw new Error('Impossible de récupérer vos annonces');
    }
  }
};

export default annonceService;
