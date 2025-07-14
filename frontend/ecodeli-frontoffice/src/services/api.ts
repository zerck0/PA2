import axios from 'axios';

// Configuration dynamique de l'URL API selon l'environnement
const API_BASE_URL = import.meta.env.PROD
  ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api`
  : '/api'; // Utilise le proxy Vite en développement

console.log('🔗 Configuration API:', {
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD,
  viteApiUrl: import.meta.env.VITE_API_URL,
  finalApiUrl: API_BASE_URL
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      // Ne pas rediriger si on est déjà sur la page de login ou d'inscription
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/verify-email') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/inscriptions', userData);
    return response.data;
  },
};

// Services des annonces
export const annonceApi = {
  getAll: async () => {
    const response = await api.get('/annonces');
    return response.data;
  },
  
  create: async (annonceData: any, auteurId: number) => {
    const response = await api.post(`/annonces?auteurId=${auteurId}`, annonceData);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/annonces/${id}`);
    return response.data;
  },

  getMesAnnonces: async (userId: number) => {
    const response = await api.get(`/annonces/mes-annonces/${userId}`);
    return response.data;
  },
};

// Services des utilisateurs
export const userApi = {
  getProfile: async () => {
    const response = await api.get('/utilisateurs/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/utilisateurs/profile', userData);
    return response.data;
  },
};

// Services des photos
export const photoApi = {
  uploadAnnoncePhoto: async (file: File, userId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    
    try {
      const response = await api.post('/photos/annonce/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      // Gestion spécifique de l'erreur 413 (Payload Too Large)
      if (error.response?.status === 413) {
        throw new Error('La photo est trop volumineuse pour le serveur. Choisissez une image plus petite (max 1MB).');
      }
      
      // Autres erreurs du serveur
      if (error.response?.status >= 400) {
        throw new Error(error.response?.data?.message || `Erreur serveur: ${error.response.status}`);
      }
      
      // Erreurs réseau
      if (error.code === 'NETWORK_ERROR') {
        throw new Error('Problème de connexion. Vérifiez votre connexion internet.');
      }
      
      // Rethrow l'erreur originale si pas de cas spécifique
      throw error;
    }
  },
};

// Services des entrepôts
export const entrepotApi = {
  getAll: async () => {
    const response = await api.get('/entrepots');
    return response.data;
  },
};

// Services des livraisons
export const livraisonApi = {
  creerComplete: async (annonceId: number, livreurId: number, prixConvenu?: number) => {
    const params = new URLSearchParams({
      annonceId: annonceId.toString(),
      livreurId: livreurId.toString(),
    });
    if (prixConvenu) {
      params.append('prixConvenu', prixConvenu.toString());
    }
    
    const response = await api.post(`/livraisons/complete?${params}`);
    return response.data;
  },

  creerPartielleDepot: async (annonceId: number, livreurId: number, entrepotId: number, prixConvenu?: number) => {
    const params = new URLSearchParams({
      annonceId: annonceId.toString(),
      livreurId: livreurId.toString(),
      entrepotId: entrepotId.toString(),
    });
    if (prixConvenu) {
      params.append('prixConvenu', prixConvenu.toString());
    }
    
    const response = await api.post(`/livraisons/partielle-depot?${params}`);
    return response.data;
  },

  creerPartielleRetrait: async (annonceId: number, livreurId: number, entrepotId: number, prixConvenu?: number) => {
    const params = new URLSearchParams({
      annonceId: annonceId.toString(),
      livreurId: livreurId.toString(),
      entrepotId: entrepotId.toString(),
    });
    if (prixConvenu) {
      params.append('prixConvenu', prixConvenu.toString());
    }
    
    const response = await api.post(`/livraisons/partielle-retrait?${params}`);
    return response.data;
  },

  getLivraisonsByLivreur: async (livreurId: number) => {
    const response = await api.get(`/livraisons/livreur/${livreurId}`);
    return response.data;
  },

  getLivraisonsByAnnonce: async (annonceId: number) => {
    const response = await api.get(`/livraisons/annonce/${annonceId}`);
    return response.data;
  },

  getLivraisonById: async (id: number) => {
    const response = await api.get(`/livraisons/${id}`);
    return response.data;
  },


  terminerLivraison: async (id: number, codeValidation: string) => {
    const params = new URLSearchParams({
      codeValidation: codeValidation
    });
    const response = await api.put(`/livraisons/${id}/terminer?${params}`);
    return response.data;
  },

  annulerLivraison: async (id: number) => {
    const response = await api.put(`/livraisons/${id}/annuler`);
    return response.data;
  },

  commencerLivraison: async (id: number) => {
    const response = await api.put(`/livraisons/${id}/commencer`);
    return response.data;
  },

  getSegmentsInfo: async (annonceId: number) => {
    const response = await api.get(`/livraisons/annonce/${annonceId}/segments-info`);
    return response.data;
  },

  getSegmentDepotByAnnonce: async (annonceId: number) => {
    try {
      const response = await api.get(`/livraisons/annonce/${annonceId}/segment-depot`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Aucun segment dépôt trouvé
      }
      throw error;
    }
  },
};

// Services d'affiliation des livreurs
export const affiliationApi = {
  demanderAffiliation: async (livreurId: number, commentaire?: string) => {
    const response = await api.post(`/livreurs/${livreurId}/demander-affiliation`, commentaire || '');
    return response.data;
  },

  getStatutAffiliation: async (livreurId: number) => {
    const response = await api.get(`/livreurs/${livreurId}/statut-affiliation`);
    return response.data;
  },

  validerAffiliation: async (livreurId: number, valider: boolean, commentaire?: string) => {
    const params = new URLSearchParams({
      valider: valider.toString()
    });
    if (commentaire) {
      params.append('commentaire', commentaire);
    }
    const response = await api.put(`/livreurs/${livreurId}/valider-affiliation?${params}`);
    return response.data;
  },
};

// Services des annonces commerçants
export const annonceCommercantApi = {
  getAll: async () => {
    const response = await api.get('/annonces-commercants');
    return response.data;
  },

  getByCommercant: async (commercantId: number) => {
    const response = await api.get(`/annonces-commercants/commercant/${commercantId}`);
    return response.data;
  },

  // Nouvelle méthode : Récupérer les annonces pour livreurs affiliés
  getForAffiliatedDeliverers: async () => {
    const response = await api.get('/annonces-commercants/affilies');
    return response.data;
  },

  // Nouvelle méthode : Prendre en charge une annonce commerçant
  prendreEnCharge: async (annonceId: number, livreurId: number) => {
    const response = await api.post(`/annonces-commercants/${annonceId}/prendre-en-charge?livreurId=${livreurId}`);
    return response.data;
  },

  create: async (annonceData: any, commercantId: number) => {
    const response = await api.post(`/annonces-commercants?commercantId=${commercantId}`, annonceData);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/annonces-commercants/${id}`);
    return response.data;
  },

  update: async (id: number, annonceData: any) => {
    const response = await api.put(`/annonces-commercants/${id}`, annonceData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/annonces-commercants/${id}`);
    return response.data;
  },

  countByCommercant: async (commercantId: number) => {
    const response = await api.get(`/annonces-commercants/count/commercant/${commercantId}`);
    return response.data;
  },
};

// Services des contrats commerçants
export const contratApi = {
  getByCommercant: async (commercantId: number) => {
    const response = await api.get(`/contrats/commercant/${commercantId}`);
    return response.data;
  },

  hasContrat: async (commercantId: number) => {
    const response = await api.get(`/contrats/commercant/${commercantId}/exists`);
    return response.data;
  },

  getByNumero: async (numeroContrat: string) => {
    const response = await api.get(`/contrats/numero/${numeroContrat}`);
    return response.data;
  },

  create: async (contratData: any, commercantId: number) => {
    const response = await api.post(`/contrats/commercant/${commercantId}`, contratData);
    return response.data;
  },

  update: async (contratId: number, contratData: any) => {
    const response = await api.put(`/contrats/${contratId}`, contratData);
    return response.data;
  },

  delete: async (contratId: number) => {
    const response = await api.delete(`/contrats/${contratId}`);
    return response.data;
  },
};

// Services des prestations
export const prestationApi = {
  // Récupérer les prestations d'un prestataire
  getByPrestataire: async (prestataireId: number) => {
    const response = await api.get(`/prestations/prestataire/${prestataireId}`);
    return response.data;
  },

  // Récupérer les disponibilités d'un prestataire
  getDisponibilites: async (prestataireId: number) => {
    const response = await api.get(`/prestations/prestataire/${prestataireId}/disponibilites`);
    return response.data;
  },

  // Configurer les disponibilités d'un prestataire
  configurerDisponibilites: async (prestataireId: number, plages: any[]) => {
    const response = await api.post(`/prestations/prestataire/${prestataireId}/disponibilites`, plages);
    return response.data;
  },

  // Créer une réservation de prestation
  creerReservation: async (reservationData: {
    prestataireId: number;
    clientId: number;
    dateDebut: string;
    dateFin: string;
    typePrestation: string;
    adresse: string;
    ville: string;
    codePostal: string;
  }) => {
    const response = await api.post('/prestations/reserver', reservationData);
    return response.data;
  },

  // Vérifier la disponibilité d'un prestataire
  verifierDisponibilite: async (prestataireId: number, dateDebut: string, dateFin: string) => {
    const response = await api.post(`/prestations/prestataire/${prestataireId}/verifier-disponibilite`, {
      dateDebut,
      dateFin
    });
    return response.data;
  },

  // Annuler une prestation
  annuler: async (prestationId: number, utilisateurId: number) => {
    const response = await api.put(`/prestations/${prestationId}/annuler?utilisateurId=${utilisateurId}`);
    return response.data;
  },

  // Terminer une prestation
  terminer: async (prestationId: number) => {
    const response = await api.put(`/prestations/${prestationId}/terminer`);
    return response.data;
  },

  // Récupérer les revenus mensuels
  getRevenusMensuel: async (prestataireId: number, annee: number, mois: number) => {
    const response = await api.get(`/prestations/prestataire/${prestataireId}/revenus?annee=${annee}&mois=${mois}`);
    return response.data;
  },

  // Récupérer les types de prestations
  getTypes: async () => {
    const response = await api.get('/prestations/types');
    return response.data;
  },

  // Récupérer les statuts de prestations
  getStatuts: async () => {
    const response = await api.get('/prestations/statuts');
    return response.data;
  },

  // Récupérer les catégories de prestations groupées
  getCategories: async () => {
    const response = await api.get('/prestations/categories');
    return response.data;
  },

  // Configurer le profil d'un prestataire
  configurerProfil: async (prestataireId: number, profilData: {
    descriptionPrestation: string;
    typePrestationPrincipale: string | null;
    photoPrestation?: string;
  }) => {
    try {
      const response = await api.post(`/prestations/prestataire/${prestataireId}/configurer-profil`, profilData);
      return response.data;
    } catch (error: any) {
      // Gestion spécifique de l'erreur 400 (Bad Request)
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Données de profil invalides';
        throw new Error(`Erreur de validation: ${errorMessage}`);
      }
      
      // Erreur 404 (Prestataire non trouvé)
      if (error.response?.status === 404) {
        throw new Error('Prestataire non trouvé. Veuillez vous reconnecter.');
      }
      
      // Autres erreurs du serveur
      if (error.response?.status >= 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
      
      // Rethrow l'erreur originale si pas de cas spécifique
      throw error;
    }
  },

  // Récupérer le profil d'un prestataire
  getProfil: async (prestataireId: number) => {
    const response = await api.get(`/prestations/prestataire/${prestataireId}/profil`);
    return response.data;
  },
};

export default api;
