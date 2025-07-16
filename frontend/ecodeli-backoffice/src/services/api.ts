import type { 
  User, AuthResponse, LoginData, Document, Annonce, AnnonceCommercant, 
  Livraison, Prestation, DashboardStats, ValidateDocumentRequest,
  UpdateUserRequest, UserFilters, DocumentFilters
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

// Configuration par défaut pour fetch
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Fonction pour récupérer le token d'authentification
const getAuthToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

// Fonction pour ajouter le token aux headers
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    ...defaultHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fonction utilitaire pour gérer les erreurs API
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
    throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
  }
  return response;
};

// === AUTHENTIFICATION ===

export const authService = {
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(credentials),
    });
    
    await handleApiError(response);
    const authResponse = await response.json();
    
    // Vérifier que l'utilisateur est bien admin
    if (authResponse.user.role !== 'ADMIN') {
      throw new Error('Accès refusé : seuls les administrateurs peuvent accéder au BackOffice');
    }
    
    // Stocker le token pour les requêtes futures
    localStorage.setItem('adminToken', authResponse.token);
    
    return authResponse;
  },

  async verifyToken(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    const responseData = await response.json();
    
    if (!responseData.valid || !responseData.user) {
      throw new Error('Token invalide');
    }
    
    if (responseData.user.role !== 'ADMIN') {
      throw new Error('Accès refusé : seuls les administrateurs peuvent accéder au BackOffice');
    }
    
    return responseData.user;
  },

  logout(): void {
    localStorage.removeItem('adminToken');
  },
};

// === UTILISATEURS ===

export const userService = {
  async getAllUsers(filters?: UserFilters): Promise<User[]> {
    let url = `${API_BASE_URL}/utilisateurs`;
    
    if (filters?.role) {
      url = `${API_BASE_URL}/utilisateurs/role/${filters.role}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    return response.json();
  },

  async getUserById(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    return response.json();
  },

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    await handleApiError(response);
    return response.json();
  },

  async suspendUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ statut: 'SUSPENDU' }),
    });
    
    await handleApiError(response);
  },

  async activateUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ statut: 'VALIDE' }),
    });
    
    await handleApiError(response);
  },

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
  },

  async getUsersCount(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    return response.json();
  },
};

// === DOCUMENTS ===

export const documentService = {
  async getAllDocuments(filters?: DocumentFilters): Promise<Document[]> {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    return response.json();
  },

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    const response = await fetch(`${API_BASE_URL}/documents/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    return response.json();
  },

  async validateDocument(request: ValidateDocumentRequest): Promise<void> {
    const { documentId, statut, commentaire } = request;
    
    const endpoint = statut === 'VALIDE' 
      ? `${API_BASE_URL}/documents/${documentId}/valider`
      : `${API_BASE_URL}/documents/${documentId}/refuser`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: commentaire ? JSON.stringify({ commentaire }) : undefined,
    });
    
    await handleApiError(response);
  },

  async getDocumentFile(documentId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/file`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    
    await handleApiError(response);
    return response.blob();
  },
};

// === ANNONCES ===

export const annonceService = {
  async getAllAnnonces(): Promise<Annonce[]> {
    const response = await fetch(`${API_BASE_URL}/annonces`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    return response.json();
  },

  async getAllAnnoncesCommercant(): Promise<AnnonceCommercant[]> {
    const response = await fetch(`${API_BASE_URL}/annonces-commercant`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    return response.json();
  },

  async deleteAnnonce(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/annonces/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
  },

  async deleteAnnonceCommercant(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/annonces-commercant/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
  },
};

// === LIVRAISONS ===

export const livraisonService = {
  async getAllLivraisons(): Promise<Livraison[]> {
    // TODO: Implémenter un endpoint pour récupérer toutes les livraisons
    const response = await fetch(`${API_BASE_URL}/livraisons/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    // Pour l'instant on retourne un tableau vide
    return [];
  },

  async getLivraisonById(id: number): Promise<Livraison> {
    const response = await fetch(`${API_BASE_URL}/livraisons/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    await handleApiError(response);
    return response.json();
  },
};

// === PRESTATIONS ===

export const prestationService = {
  async getAllPrestations(): Promise<Prestation[]> {
    // TODO: Implémenter un endpoint pour récupérer toutes les prestations
    throw new Error('Endpoint getAllPrestations non implémenté');
  },
};

// === STATISTIQUES ===

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Récupérer les statistiques en parallèle
      const [
        totalUtilisateurs,
        // TODO: Ajouter d'autres endpoints de statistiques
      ] = await Promise.all([
        userService.getUsersCount(),
        // documentsEnAttente,
        // etc.
      ]);

      return {
        totalUtilisateurs,
        totalClients: 0, // TODO: Implémenter
        totalLivreurs: 0, // TODO: Implémenter
        totalCommercants: 0, // TODO: Implémenter
        totalPrestataires: 0, // TODO: Implémenter
        documentsEnAttente: 0, // TODO: Implémenter
        annonceActives: 0, // TODO: Implémenter
        livraisonsEnCours: 0, // TODO: Implémenter
        prestationsActives: 0, // TODO: Implémenter
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },
};

// Export par défaut d'un objet contenant tous les services
export default {
  auth: authService,
  users: userService,
  documents: documentService,
  annonces: annonceService,
  livraisons: livraisonService,
  prestations: prestationService,
  stats: statsService,
};
