export interface BaseUser {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  role?: string;
  telephone?: string;
  dateCreation?: string;
  adresse?: string;
  ville?: string;
  codepostal?: string;
}

export interface DeliveryPerson extends BaseUser {
  vehicule: string;
  permisVerif: boolean;
}

export type FormData = {
  role: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  vehicule?: string;
  permisVerif?: boolean;
  siret?: string;
  typeService?: string;
  tarifHoraire?: number;
};