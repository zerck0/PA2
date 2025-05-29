import { useState, useCallback, useRef } from "react";
import authService from "../services/authService";
import { validateForm, FormData, ValidationErrors } from "../utils/formValidation";

export const useRegistrationForm = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<FormData>({
    role: 'CLIENT',
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    vehicule: '',
    permisVerif: false,
    siret: '',
    typeService: '',
    tarifHoraire: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Fonction pour vérifier la disponibilité de l'email
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailAvailable(null);
      return;
    }
    
    setCheckingEmail(true);
    try {
      const isAvailable = await authService.checkEmailAvailability(email);
      setEmailAvailable(isAvailable);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Réinitialiser l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Vérifier l'email en temps réel avec un délai
    if (name === 'email') {
      setEmailAvailable(null);
      
      // Annuler le timeout précédent s'il existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Créer un nouveau timeout
      timeoutRef.current = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);
    }
  }, [checkEmailAvailability, errors]);

  const validate = useCallback(() => {
    const validation = validateForm(formData);
    setErrors(validation.errors);
    return validation.isValid; // ← Retourner isValid
  }, [formData]);

  return {
    formData,
    errors,
    emailAvailable,
    checkingEmail,
    handleChange,
    validate
  };
};