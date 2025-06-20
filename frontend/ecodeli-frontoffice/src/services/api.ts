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
  
  create: async (annonceData: any) => {
    const response = await api.post('/annonces', annonceData);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/annonces/${id}`);
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

export default api;
