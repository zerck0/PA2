/**
 * Configuration centralisée de l'application EcoDeli
 * Contient toutes les constantes, URLs API, et configuration métier
 */

// Configuration de l'API backend Spring Boot
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    AUTH: '/auth',
    ANNONCES: '/annonces',
    USERS: '/users',
    LIVREURS: '/livreurs'
  }
} as const;

// Rôles utilisateurs disponibles dans l'application
export const USER_ROLES = {
  CLIENT: 'CLIENT',
  LIVREUR: 'LIVREUR', 
  COMMERCANT: 'COMMERCANT',
  PRESTATAIRE: 'PRESTATAIRE'
} as const;

// Types dérivés pour TypeScript
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Configuration de navigation - Menus publics accessibles à tous (Livraison et Stockage masqués)
export const PUBLIC_NAVIGATION = [
  { label: 'Accueil', path: '/', icon: 'bi-house' },
  { label: 'Annonces', path: '/annonces', icon: 'bi-megaphone' },
  { label: 'Services', path: '/services', icon: 'bi-gear' },
  { label: 'Comment ça marche', path: '/how-it-works', icon: 'bi-question-circle' },
  { label: 'Contact', path: '/contact', icon: 'bi-envelope' }
] as const;

// Actions communes à tous les utilisateurs connectés
export const COMMON_USER_ACTIONS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'bi-speedometer2' },
  { label: 'Créer une annonce', path: '/annonces/creer', icon: 'bi-plus-circle' },
  { label: 'Messages', path: '/messages', icon: 'bi-chat-dots' }
] as const;

// Actions spécifiques par rôle utilisateur
export const ROLE_SPECIFIC_ACTIONS = {
  [USER_ROLES.CLIENT]: [
    { label: 'Mes annonces', path: '/client/annonces', icon: 'bi-clipboard-check' }
  ],
  [USER_ROLES.LIVREUR]: [
    { label: 'Annonces disponibles', path: '/livreur/annonces', icon: 'bi-truck' },
    { label: 'Mes missions', path: '/livreur/missions', icon: 'bi-box-seam' }
  ],
  [USER_ROLES.COMMERCANT]: [
    { label: 'Mes contrats', path: '/commercant/contrats', icon: 'bi-file-text' },
    { label: 'Mes annonces', path: '/commercant/annonces', icon: 'bi-shop' }
  ],
  [USER_ROLES.PRESTATAIRE]: [
    { label: 'Mes prestations', path: '/prestataire/prestations', icon: 'bi-tools' },
    { label: 'Mon calendrier', path: '/prestataire/calendrier', icon: 'bi-calendar3' }
  ]
} as const;

// Actions système (profil, paramètres, déconnexion)
export const SYSTEM_ACTIONS = [
  { label: 'Mon profil', path: '/profile', icon: 'bi-person', divider: true },
  { label: 'Paramètres', path: '/settings', icon: 'bi-gear' },
  { label: 'Déconnexion', action: 'logout', icon: 'bi-box-arrow-right', divider: true }
] as const;

// Configuration des statuts d'annonces
export const ANNONCE_STATUS = {
  ACTIVE: 'ACTIVE',
  EN_COURS: 'EN_COURS',
  TERMINEE: 'TERMINEE',
  ANNULEE: 'ANNULEE'
} as const;

// Configuration des types de livraison (priorité/vitesse)
export const DELIVERY_TYPES = {
  EXPRESS: 'EXPRESS',
  STANDARD: 'STANDARD',
  ECONOMIQUE: 'ECONOMIQUE'
} as const;

// Types d'annonces EcoDeli basés sur les services proposés
export const ANNONCE_TYPES = {
  LIVRAISON: 'LIVRAISON',
  TRANSPORT_PERSONNE: 'TRANSPORT_PERSONNE',
  SERVICES_PERSONNE: 'SERVICES_PERSONNE',
  ACHATS_ETRANGER: 'ACHATS_ETRANGER',
  GARDE_ANIMAUX: 'GARDE_ANIMAUX',
  TRAVAUX_MENAGERS: 'TRAVAUX_MENAGERS'
} as const;

// Labels et icônes pour les types d'annonces
export const ANNONCE_TYPE_CONFIG = {
  [ANNONCE_TYPES.LIVRAISON]: {
    label: 'Livraison & Transport de colis',
    icon: 'bi-truck',
    color: 'primary',
    description: 'Transport de colis, livraison intégrale ou partielle'
  },
  [ANNONCE_TYPES.TRANSPORT_PERSONNE]: {
    label: 'Transport de personnes',
    icon: 'bi-people',
    color: 'info',
    description: 'Emmener quelqu\'un quelque part, transfert aéroport'
  },
  [ANNONCE_TYPES.SERVICES_PERSONNE]: {
    label: 'Services à la personne',
    icon: 'bi-person-check',
    color: 'success',
    description: 'Courses, aide à domicile, assistance'
  },
  [ANNONCE_TYPES.ACHATS_ETRANGER]: {
    label: 'Achats à l\'étranger',
    icon: 'bi-globe',
    color: 'warning',
    description: 'Rapporter des produits depuis l\'étranger'
  },
  [ANNONCE_TYPES.GARDE_ANIMAUX]: {
    label: 'Garde d\'animaux',
    icon: 'bi-heart',
    color: 'pink',
    description: 'Garder des animaux à domicile'
  },
  [ANNONCE_TYPES.TRAVAUX_MENAGERS]: {
    label: 'Travaux ménagers',
    icon: 'bi-tools',
    color: 'secondary',
    description: 'Petits travaux ménagers, jardinage'
  }
} as const;

// Constantes de validation des formulaires
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+33|0)[1-9](\d{8})$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500
} as const;

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page',
  FORBIDDEN: 'Vous n\'avez pas les droits pour accéder à cette ressource',
  NOT_FOUND: 'La ressource demandée n\'existe pas',
  VALIDATION_ERROR: 'Veuillez vérifier les données saisies'
} as const;
