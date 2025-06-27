export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: 'CLIENT' | 'LIVREUR' | 'COMMERCANT' | 'PRESTATAIRE';
  statut: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VALIDE' | 'SUSPENDU' | 'REFUSE';
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
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'EN_COURS' | 'LIVREE' | 'STOCKEE' | 'ANNULEE' | 'ECHEC';
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
  annonce: Annonce;
}
