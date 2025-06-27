import axios from 'axios';

// Configuration dynamique de l'URL API selon l'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'; // Utilise le proxy Vite en développement

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/inscriptions', userData);
    return response.data;
  },
};

// Services des annonces
export const annonceApi = {
  getAll: async () => {
    const response = await api.get('/annonces');
    return response.data;
  },
  
  create: async (annonceData: any, auteurId: number) => {
    const response = await api.post(`/annonces?auteurId=${auteurId}`, annonceData);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/annonces/${id}`);
    return response.data;
  },

  getMesAnnonces: async (userId: number) => {
    const response = await api.get(`/annonces/mes-annonces/${userId}`);
    return response.data;
  },
};

// Services des utilisateurs
export const userApi = {
  getProfile: async () => {
    const response = await api.get('/utilisateurs/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/utilisateurs/profile', userData);
    return response.data;
  },
};

// Services des photos
export const photoApi = {
  uploadAnnoncePhoto: async (file: File, userId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    
    const response = await api.post('/photos/annonce/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Services des entrepôts
export const entrepotApi = {
  getAll: async () => {
    const response = await api.get('/entrepots');
    return response.data;
  },
};

// Services des livraisons
export const livraisonApi = {
  creerComplete: async (annonceId: number, livreurId: number, prixConvenu?: number) => {
    const params = new URLSearchParams({
      annonceId: annonceId.toString(),
      livreurId: livreurId.toString(),
    });
    if (prixConvenu) {
      params.append('prixConvenu', prixConvenu.toString());
    }
    
    const response = await api.post(`/livraisons/complete?${params}`);
    return response.data;
  },

  creerPartielleDepot: async (annonceId: number, livreurId: number, entrepotId: number, prixConvenu?: number) => {
    const params = new URLSearchParams({
      annonceId: annonceId.toString(),
      livreurId: livreurId.toString(),
      entrepotId: entrepotId.toString(),
    });
    if (prixConvenu) {
      params.append('prixConvenu', prixConvenu.toString());
    }
    
    const response = await api.post(`/livraisons/partielle-depot?${params}`);
    return response.data;
  },

  creerPartielleRetrait: async (annonceId: number, livreurId: number, entrepotId: number, prixConvenu?: number) => {
    const params = new URLSearchParams({
      annonceId: annonceId.toString(),
      livreurId: livreurId.toString(),
      entrepotId: entrepotId.toString(),
    });
    if (prixConvenu) {
      params.append('prixConvenu', prixConvenu.toString());
    }
    
    const response = await api.post(`/livraisons/partielle-retrait?${params}`);
    return response.data;
  },

  getLivraisonsByLivreur: async (livreurId: number) => {
    const response = await api.get(`/livraisons/livreur/${livreurId}`);
    return response.data;
  },

  getLivraisonById: async (id: number) => {
    const response = await api.get(`/livraisons/${id}`);
    return response.data;
  },


  terminerLivraison: async (id: number, codeValidation: string) => {
    const params = new URLSearchParams({
      codeValidation: codeValidation
    });
    const response = await api.put(`/livraisons/${id}/terminer?${params}`);
    return response.data;
  },

  annulerLivraison: async (id: number) => {
    const response = await api.put(`/livraisons/${id}/annuler`);
    return response.data;
  },
};

export default api;
