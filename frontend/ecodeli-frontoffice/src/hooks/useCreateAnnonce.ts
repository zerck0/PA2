import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CreateAnnonceDTO, TypeAnnonce } from '../types/annonce';
import { annonceService } from '../services/annonceService';

/**
 * Hook personnalisé pour la création d'annonces
 * Gère tous les états et la logique métier du formulaire
 */
export const useCreateAnnonce = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  // États principaux
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validated, setValidated] = useState(false);

  // Données du formulaire avec valeurs par défaut
  const [formData, setFormData] = useState<CreateAnnonceDTO>({
    titre: '',
    description: '',
    type: '',
    adresseDepart: '',
    adresseArrivee: '',
    villeDepart: '',
    villeArrivee: '',
    prixPropose: 0,
    prixNegociable: 0,
    dateLimite: '',
    datePreferee: '',
    typeColis: '',
    poids: 0,
    dimensions: '',
    fragile: false
  });

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Valide le formulaire avant soumission
   */
  const validateForm = (form: HTMLFormElement): boolean => {
    if (form.checkValidity() === false) {
      setValidated(true);
      return false;
    }
    return true;
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as HTMLFormElement;
    
    // Validation du formulaire
    if (!validateForm(form)) {
      e.stopPropagation();
      return;
    }

    // Vérification utilisateur connecté
    if (!currentUser) {
      setError('Vous devez être connecté pour créer une annonce');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Création de l'annonce via l'API
      await annonceService.createAnnonce(formData, currentUser.user.id);
      setSuccess(true);
      
      // Redirection après succès
      setTimeout(() => {
        navigate('/annonces');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remet à zéro les erreurs
   */
  const clearError = () => {
    setError('');
  };

  /**
   * Annule et retourne à la liste des annonces
   */
  const handleCancel = () => {
    navigate('/annonces');
  };

  /**
   * Détermine si on affiche les champs spécifiques au colis
   */
  const isLivraisonType = formData.type === TypeAnnonce.LIVRAISON_COLIS;

  return {
    // États
    formData,
    loading,
    error,
    success,
    validated,
    currentUser,
    isLivraisonType,
    
    // Actions
    handleInputChange,
    handleSubmit,
    handleCancel,
    clearError
  };
};
