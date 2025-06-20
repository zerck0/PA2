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
  prix?: number;
  villeDepart: string;
  villeArrivee: string;
  dateCreation: string;
  dateExpiration?: string;
  statut: 'ACTIVE' | 'INACTIVE' | 'EXPIREE';
  utilisateur: User;
}

export interface CreateAnnonceData {
  titre: string;
  description: string;
  prix?: number;
  villeDepart: string;
  villeArrivee: string;
  dateExpiration?: string;
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
