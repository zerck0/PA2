// Types principaux (copiés du front-office)
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: 'CLIENT' | 'LIVREUR' | 'COMMERCANT' | 'PRESTATAIRE' | 'ADMIN';
  statut: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VALIDE' | 'SUSPENDU' | 'REFUSE';
  adresse?: string;
  ville?: string;
  codepostal?: string;
  dateCreation?: string;
  // Champs spécifiques au livreur
  statutAffiliation?: 'NON_AFFILIE' | 'DEMANDE_AFFILIATION' | 'AFFILIE' | 'AFFILIATION_REFUSEE';
  dateDemandeAffiliation?: string;
  dateValidationAffiliation?: string;
  commentaireAffiliation?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

// Interface pour les documents
export interface Document {
  id: number;
  nom: string;
  cheminFichier: string;
  type: 'PERMIS_CONDUIRE' | 'CARTE_IDENTITE' | 'ASSURANCE' | 'KBIS' | 'CERTIFICAT' | 
        'PHOTO_ANNONCE' | 'JUSTIFICATIF_DOMICILE' | 'STATUT_AUTOENTREPRENEUR' | 
        'ASSURANCE_PROFESSIONNELLE' | 'CASIER_JUDICIAIRE' | 'DIPLOMES_CERTIFICATIONS' | 
        'ASSURANCE_VEHICULE';
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  dateUpload: string;
  dateValidation?: string;
  commentaireValidation?: string;
  utilisateurId: number;
  utilisateur?: User;
}

// Interface pour les annonces
export interface Annonce {
  id: number;
  titre: string;
  description: string;
  type: 'LIVRAISON_COLIS' | 'COURSES' | 'TRANSPORT_PERSONNE' | 'SERVICE_PERSONNE' | 'ACHAT_ETRANGER';
  adresseDepart: string;
  adresseArrivee: string;
  villeDepart: string;
  villeArrivee: string;
  prixPropose?: number;
  dateCreation: string;
  statut: 'ACTIVE' | 'ASSIGNEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  auteur: User;
}

// Interface pour les annonces commerçant
export interface AnnonceCommercant {
  id: number;
  titre: string;
  description: string;
  adresseDepart: string;
  adresseArrivee: string;
  villeDepart: string;
  villeArrivee: string;
  listeCourses: string;
  prixPropose: number;
  reserveAuxAffilies: boolean;
  dateCreation: string;
  statut: 'ACTIVE' | 'ASSIGNEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  commercant: User;
  livreurAssigne?: User;
}

// Interface pour les livraisons
export interface Livraison {
  id: number;
  typeLivraison: 'COMPLETE' | 'PARTIELLE_DEPOT' | 'PARTIELLE_RETRAIT';
  statut: 'ASSIGNEE' | 'EN_COURS' | 'LIVREE' | 'STOCKEE' | 'ANNULEE';
  adresseDepart: string;
  adresseArrivee: string;
  codeValidation: string;
  dateCreation: string;
  dateDebut?: string;
  dateFin?: string;
  prixConvenu?: number;
  livreur?: User;
  annonce?: Annonce;
  annonceCommercant?: AnnonceCommercant;
}

// Interface pour les prestations
export interface Prestation {
  id: number;
  titre: string;
  description: string;
  typePrestation: string;
  dateDebut: string;
  dateFin: string;
  adresse: string;
  ville: string;
  prix: number;
  statut: 'RESERVEE' | 'TERMINEE' | 'EVALUEE' | 'ANNULEE';
  dateCreation: string;
  prestataire: User;
  client: User;
}

// Interface pour les statistiques
export interface DashboardStats {
  totalUtilisateurs: number;
  totalClients: number;
  totalLivreurs: number;
  totalCommercants: number;
  totalPrestataires: number;
  documentsEnAttente: number;
  annonceActives: number;
  livraisonsEnCours: number;
  prestationsActives: number;
}

// Interface pour les filtres de recherche
export interface UserFilters {
  role?: string;
  statut?: string;
  search?: string;
}

export interface DocumentFilters {
  type?: string;
  statut?: string;
  search?: string;
}

// Interface pour la validation de documents
export interface ValidateDocumentRequest {
  documentId: number;
  statut: 'VALIDE' | 'REFUSE';
  commentaire?: string;
}

// Interface pour la mise à jour d'utilisateurs
export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codepostal?: string;
  statut?: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VALIDE' | 'SUSPENDU' | 'REFUSE';
}

// Types pour les tableaux paginés
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// Interface pour les erreurs API
export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}
