/**
 * Types TypeScript centralisés pour l'application EcoDeli
 * Organisés par domaine métier pour faciliter la maintenance
 */

import { USER_ROLES, ANNONCE_STATUS, DELIVERY_TYPES, ANNONCE_TYPES } from '../constants/appConfig';

// =============================================================================
// TYPES D'AUTHENTIFICATION
// =============================================================================

/**
 * Types des rôles utilisateur
 */
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Interface représentant un utilisateur de l'application
 */
export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: UserRole;
  telephone?: string;
  dateInscription: string;
}

/**
 * Réponse de l'API lors de l'authentification
 */
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

/**
 * Données pour la connexion utilisateur
 */
export interface LoginData {
  email: string;
  motDePasse: string;
}

/**
 * Données pour l'inscription utilisateur
 */
export interface RegisterData {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  telephone: string;
  role: UserRole;
}

// =============================================================================
// TYPES D'ANNONCES
// =============================================================================

/**
 * Statuts possibles d'une annonce
 */
export type AnnonceStatus = typeof ANNONCE_STATUS[keyof typeof ANNONCE_STATUS];

/**
 * Types de livraison disponibles (priorité/vitesse)
 */
export type DeliveryType = typeof DELIVERY_TYPES[keyof typeof DELIVERY_TYPES];

/**
 * Types d'annonces EcoDeli (nature du service)
 */
export type AnnonceType = typeof ANNONCE_TYPES[keyof typeof ANNONCE_TYPES];

/**
 * Interface principale d'une annonce
 */
export interface Annonce {
  id: number;
  titre: string;
  description: string;
  prix: number;
  dateCreation: string;
  dateLivraison: string;
  status: AnnonceStatus;
  typelivraison: DeliveryType;
  typeAnnonce?: AnnonceType; // Type de service EcoDeli
  adresseEnlevement: string;
  adresseLivraison: string;
  client: User;
  livreur?: User;
  // Informations sur le colis
  poids?: number;
  dimensions?: string;
  fragile?: boolean;
}

/**
 * Données pour créer une nouvelle annonce
 */
export interface CreateAnnonceData {
  titre: string;
  description: string;
  prix: number;
  dateLivraison: string;
  typelivraison: DeliveryType;
  typeAnnonce?: AnnonceType;
  adresseEnlevement: string;
  adresseLivraison: string;
  poids?: number;
  dimensions?: string;
  fragile?: boolean;
}

/**
 * Filtres pour la recherche d'annonces
 */
export interface AnnonceFilters {
  search?: string;
  typelivraison?: DeliveryType;
  typeAnnonce?: AnnonceType;
  prixMin?: number;
  prixMax?: number;
  dateDebut?: string;
  dateFin?: string;
  ville?: string;
}

// =============================================================================
// TYPES DE NAVIGATION
// =============================================================================

/**
 * Item de menu de navigation
 */
export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  requiresAuth?: boolean;
}

/**
 * Action utilisateur dans le menu profil
 */
export interface UserAction {
  label: string;
  path?: string;
  action?: string;
  icon: string;
  divider?: boolean;
}

// =============================================================================
// TYPES DE FORMULAIRES
// =============================================================================

/**
 * État de validation d'un champ de formulaire
 */
export interface FieldValidation {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * État global d'un formulaire
 */
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isValid: boolean;
  isSubmitting: boolean;
}

// =============================================================================
// TYPES D'API
// =============================================================================

/**
 * Réponse standard de l'API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

/**
 * Erreur API standardisée
 */
export interface ApiError {
  status: number;
  message: string;
  details?: string[];
}

/**
 * Options de pagination pour les listes
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Réponse paginée de l'API
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// TYPES D'ÉTAT GLOBAL
// =============================================================================

/**
 * État de l'authentification dans le contexte global
 */
export interface AuthState {
  currentUser: {
    user: User;
    token: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * État de chargement pour les composants
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// TYPES UTILITAIRES
// =============================================================================

/**
 * Type pour rendre certaines propriétés optionnelles
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Type pour les composants React avec enfants
 */
export interface WithChildren {
  children: React.ReactNode;
}

/**
 * Props communes pour les composants de formulaire
 */
export interface BaseFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  error?: string;
}
