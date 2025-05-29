export interface FormData {
  role: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  vehicule?: string;
  permisVerif?: boolean;
  siret?: string;
  typeService?: string;
  tarifHoraire?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateForm = (formData: FormData): { isValid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};

  // Validation des champs communs
  if (!formData.nom.trim()) {
    errors.nom = "Le nom est obligatoire";
  }
  
  if (!formData.prenom.trim()) {
    errors.prenom = "Le prénom est obligatoire";
  }
  
  if (!formData.email.trim()) {
    errors.email = "L'email est obligatoire";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Format d'email invalide";
  }
  
  if (formData.password.length < 6) {
    errors.password = "Le mot de passe doit contenir au moins 6 caractères";
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
  }
  
  if (!formData.telephone.trim()) {
    errors.telephone = "Le téléphone est obligatoire";
  } else if (!/^\d{10}$/.test(formData.telephone.replace(/\s/g, ''))) {
    errors.telephone = "Le téléphone doit contenir 10 chiffres";
  }

  // Validations spécifiques au rôle
  switch (formData.role) {
    case 'LIVREUR':
      if (!formData.vehicule?.trim()) {
        errors.vehicule = "Le type de véhicule est obligatoire";
      }
      if (!formData.permisVerif) {
        errors.permisVerif = "La certification du permis est obligatoire";
      }
      break;
      
    case 'COMMERCANT':
      if (!formData.siret?.trim()) {
        errors.siret = "Le numéro SIRET est obligatoire";
      } else if (!/^\d{14}$/.test(formData.siret)) {
        errors.siret = "Le SIRET doit contenir 14 chiffres";
      }
      break;
      
    case 'PRESTATAIRE':
      if (!formData.typeService?.trim()) {
        errors.typeService = "Le type de service est obligatoire";
      }
      if (!formData.tarifHoraire || parseFloat(formData.tarifHoraire) <= 0) {
        errors.tarifHoraire = "Le tarif horaire doit être supérieur à 0";
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const isValidSIRET = (siret: string): boolean => {
  return /^\d{14}$/.test(siret);
};

export const isValidEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^\d{10}$/.test(phone.replace(/\s/g, ''));
};