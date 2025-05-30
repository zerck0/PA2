export interface Annonce {
  id: number;
  titre: string;
  description: string;
  type: TypeAnnonce;
  statut: StatutAnnonce;
  adresseDepart: string;
  adresseArrivee: string;
  villeDepart: string;
  villeArrivee: string;
  prixPropose: number;
  prixNegociable?: number;
  dateCreation: string;
  dateLimite?: string;
  datePreferee?: string;
  typeColis?: string;
  poids?: number;
  dimensions?: string;
  fragile?: boolean;
  auteur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  livreurAssigne?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export enum TypeAnnonce {
  LIVRAISON_COLIS = 'LIVRAISON_COLIS',
  SERVICE_PERSONNE = 'SERVICE_PERSONNE',
  TRANSPORT_PERSONNE = 'TRANSPORT_PERSONNE',
  COURSES = 'COURSES',
  ACHAT_ETRANGER = 'ACHAT_ETRANGER'
}

export enum StatutAnnonce {
  ACTIVE = 'ACTIVE',
  ASSIGNEE = 'ASSIGNEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE'
}

export interface CreateAnnonceDTO {
  titre: string;
  description: string;
  type: string;
  adresseDepart: string;
  adresseArrivee: string;
  villeDepart: string;
  villeArrivee: string;
  prixPropose: number;
  prixNegociable?: number;
  dateLimite?: string;
  datePreferee?: string;
  typeColis?: string;
  poids?: number;
  dimensions?: string;
  fragile?: boolean;
}

export interface AnnonceFilters {
  ville?: string;
  type?: string;
  searchTerm?: string;
}
