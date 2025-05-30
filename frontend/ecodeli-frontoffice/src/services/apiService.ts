/**
 * Service API centralisé pour toutes les requêtes vers le backend
 * Gère l'authentification, les intercepteurs et la gestion d'erreurs
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../constants/appConfig';
import { ApiResponse, ApiError } from '../types';

/**
 * Classe principale pour gérer les appels API
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    // Configuration de base d'Axios avec l'URL du backend Spring Boot
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 10000, // Timeout de 10 secondes
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Configuration des intercepteurs
    this.setupInterceptors();
  }

  /**
   * Configuration des intercepteurs Axios pour l'authentification et les erreurs
   */
  private setupInterceptors(): void {
    // Intercepteur de requête : ajout automatique du token JWT
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse : gestion des erreurs globales
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return this.handleApiError(error);
      }
    );
  }

  /**
   * Récupération du token JWT stocké localement
   */
  private getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Gestion centralisée des erreurs API
   */
  private handleApiError(error: any): Promise<never> {
    let apiError: ApiError;

    if (error.response) {
      // Erreur avec réponse du serveur
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expiré ou invalide - redirection vers login
          this.handleUnauthorized();
          apiError = {
            status,
            message: ERROR_MESSAGES.UNAUTHORIZED,
            details: data.errors
          };
          break;
        
        case 403:
          apiError = {
            status,
            message: ERROR_MESSAGES.FORBIDDEN,
            details: data.errors
          };
          break;
        
        case 404:
          apiError = {
            status,
            message: ERROR_MESSAGES.NOT_FOUND,
            details: data.errors
          };
          break;
        
        case 422:
          apiError = {
            status,
            message: ERROR_MESSAGES.VALIDATION_ERROR,
            details: data.errors
          };
          break;
        
        default:
          apiError = {
            status,
            message: data.message || 'Une erreur est survenue',
            details: data.errors
          };
      }
    } else if (error.request) {
      // Erreur réseau
      apiError = {
        status: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR
      };
    } else {
      // Autre erreur
      apiError = {
        status: 0,
        message: error.message || 'Une erreur inattendue est survenue'
      };
    }

    return Promise.reject(apiError);
  }

  /**
   * Gestion de l'erreur 401 - nettoyage et redirection
   */
  private handleUnauthorized(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirection vers la page de connexion
    window.location.href = '/login';
  }

  // =============================================================================
  // MÉTHODES HTTP GÉNÉRIQUES
  // =============================================================================

  /**
   * Requête GET générique
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * Requête POST générique
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * Requête PUT générique
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * Requête DELETE générique
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // =============================================================================
  // MÉTHODES SPÉCIFIQUES À L'AUTHENTIFICATION
  // =============================================================================

  /**
   * Connexion utilisateur
   */
  async login(email: string, password: string) {
    return this.post(`${API_CONFIG.ENDPOINTS.AUTH}/login`, {
      email,
      motDePasse: password
    });
  }

  /**
   * Inscription utilisateur
   */
  async register(userData: any) {
    return this.post(`${API_CONFIG.ENDPOINTS.AUTH}/register`, userData);
  }

  /**
   * Vérification de la validité du token
   */
  async verifyToken() {
    return this.get(`${API_CONFIG.ENDPOINTS.AUTH}/verify`);
  }

  /**
   * Déconnexion (optionnel si le backend le gère)
   */
  async logout() {
    try {
      await this.post(`${API_CONFIG.ENDPOINTS.AUTH}/logout`);
    } catch (error) {
      // Continuer même si l'API échoue
      console.warn('Erreur lors de la déconnexion API:', error);
    } finally {
      // Nettoyage local obligatoire
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // =============================================================================
  // MÉTHODES SPÉCIFIQUES AUX ANNONCES
  // =============================================================================

  /**
   * Récupération de toutes les annonces avec filtres optionnels
   */
  async getAnnonces(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
    }
    
    const url = `${API_CONFIG.ENDPOINTS.ANNONCES}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get(url);
  }

  /**
   * Récupération d'une annonce par ID
   */
  async getAnnonce(id: number) {
    return this.get(`${API_CONFIG.ENDPOINTS.ANNONCES}/${id}`);
  }

  /**
   * Création d'une nouvelle annonce
   */
  async createAnnonce(annonceData: any) {
    return this.post(API_CONFIG.ENDPOINTS.ANNONCES, annonceData);
  }

  /**
   * Mise à jour d'une annonce
   */
  async updateAnnonce(id: number, annonceData: any) {
    return this.put(`${API_CONFIG.ENDPOINTS.ANNONCES}/${id}`, annonceData);
  }

  /**
   * Suppression d'une annonce
   */
  async deleteAnnonce(id: number) {
    return this.delete(`${API_CONFIG.ENDPOINTS.ANNONCES}/${id}`);
  }

  // =============================================================================
  // MÉTHODES SPÉCIFIQUES AUX UTILISATEURS
  // =============================================================================

  /**
   * Récupération du profil utilisateur connecté
   */
  async getCurrentUser() {
    return this.get(`${API_CONFIG.ENDPOINTS.USERS}/me`);
  }

  /**
   * Mise à jour du profil utilisateur
   */
  async updateProfile(userData: any) {
    return this.put(`${API_CONFIG.ENDPOINTS.USERS}/me`, userData);
  }

  /**
   * Récupération des annonces de l'utilisateur connecté
   */
  async getUserAnnonces() {
    return this.get(`${API_CONFIG.ENDPOINTS.USERS}/me/annonces`);
  }
}

// Instance singleton du service API
export const apiService = new ApiService();

// Export par défaut pour l'import simple
export default apiService;
