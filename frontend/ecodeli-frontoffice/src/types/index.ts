export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: 'CLIENT' | 'LIVREUR' | 'COMMERCANT' | 'PRESTATAIRE';
  statut: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VALIDE' | 'SUSPENDU' | 'REFUSE';
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
  prixNegociable?: number;
  dateLimite?: string;
  datePreferee?: string;
  typeColis?: string;
  poids?: number;
  dimensions?: string;
  fragile?: boolean;
  photoUrl?: string;
  livraisonPartiellePossible?: boolean;
  dateCreation: string;
  statut: 'ACTIVE' | 'ASSIGNEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  auteur: User;
}

export interface CreateAnnonceData {
  titre: string;
  description: string;
  type: string;
  adresseDepart: string;
  adresseArrivee: string;
  villeDepart: string;
  villeArrivee: string;
  prixPropose?: number;
  prixNegociable?: number;
  dateLimite?: string;
  datePreferee?: string;
  typeColis?: string;
  poids?: number;
  dimensions?: string;
  fragile?: boolean;
  photoUrl?: string;
  livraisonPartiellePossible?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  role: 'CLIENT' | 'LIVREUR' | 'COMMERCANT' | 'PRESTATAIRE';
}

export interface Entrepot {
  id: number;
  nom: string;
  ville: string;
  adresse: string;
  codePostal: string;
  statut: 'ACTIF' | 'INACTIF' | 'MAINTENANCE';
}

export interface Livraison {
  id: number;
  typeLivraison: 'COMPLETE' | 'PARTIELLE_DEPOT' | 'PARTIELLE_RETRAIT';
  statut: 'ASSIGNEE' | 'EN_COURS' | 'LIVREE' | 'STOCKEE' | 'ANNULEE';
  adresseDepart: string;
  adresseArrivee: string;
  entrepot?: Entrepot;
  codeValidation: string;
  dateCreation: string;
  dateDebut?: string;
  dateFin?: string;
  ordre: number;
  prixConvenu?: number;
  commentaires?: string;
  // Support des deux types d'annonces
  annonce?: Annonce;
  annonceCommercant?: AnnonceCommercant;
  livreur?: User;
}

// Interface pour les annonces de commerçants
export interface AnnonceCommercant {
  id: number;
  titre: string;
  description: string;
  adresseDepart: string;
  adresseArrivee: string;
  villeDepart: string;
  villeArrivee: string;
  listeCourses: string;
  quantiteProduits?: number;
  prixPropose: number;
  reserveAuxAffilies: boolean;
  dateCreation: string;
  dateLimite?: string;
  datePreferee?: string;
  statut: 'ACTIVE' | 'ASSIGNEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  commercant: User;
  livreurAssigne?: User;
}

// Interface pour créer une annonce commerçant
export interface CreateAnnonceCommercantData {
  titre: string;
  description: string;
  adresseDepart: string;
  adresseArrivee: string;
  villeDepart: string;
  villeArrivee: string;
  listeCourses: string;
  quantiteProduits?: number;
  prixPropose: number;
  reserveAuxAffilies: boolean;
  dateLimite?: string;
  datePreferee?: string;
}

// Interface pour le statut d'affiliation
export interface StatutAffiliationResponse {
  statut: 'NON_AFFILIE' | 'DEMANDE_AFFILIATION' | 'AFFILIE' | 'AFFILIATION_REFUSEE';
  dateDemandeAffiliation?: string;
  dateValidationAffiliation?: string;
  commentaire?: string;
}

// Interface pour les contrats commerçant
export interface ContratCommercant {
  id: number;
  numeroContrat: string;
  dateDebut: string;
  dateFin?: string;
  dateSignature: string;
  statutContrat: 'ACTIF' | 'EXPIRE' | 'SUSPENDU' | 'RESILIÉ';
  
  // Conditions tarifaires
  commissionPourcentage?: number;
  fraisInscription?: number;
  abonnementMensuel?: number;
  
  // Services inclus
  livraisonRapideIncluse?: boolean;
  assuranceIncluse?: boolean;
  supportPrioritaire?: boolean;
  nombreLivraisonsMensuelles?: number;
  
  // Documents
  urlContratPdf?: string;
  cheminContratPdf?: string;
  
  // Relation
  commercant: User;
}

// Interface pour créer/modifier un contrat
export interface CreateContratData {
  dateDebut: string;
  dateFin?: string;
  dateSignature: string;
  commissionPourcentage?: number;
  fraisInscription?: number;
  abonnementMensuel?: number;
  livraisonRapideIncluse?: boolean;
  assuranceIncluse?: boolean;
  supportPrioritaire?: boolean;
  nombreLivraisonsMensuelles?: number;
  urlContratPdf?: string;
  cheminContratPdf?: string;
}
