import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';
import PasswordStrengthInput from '../components/ui/PasswordStrengthInput';
import AddressInput from '../components/ui/AddressInput';

interface RegisterFormData {
  role: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  // Champs spécifiques selon le rôle
  vehicule?: string;
  permisVerif?: boolean;
  siret?: string;
  typeService?: string;
  tarifHoraire?: number;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    role: '',
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    permisVerif: false
  });

  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Réinitialiser les erreurs de validation quand l'utilisateur modifie quelque chose
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
    // Réinitialiser les erreurs de validation quand l'utilisateur modifie quelque chose
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Fonction helper pour les champs Input avec réinitialisation des erreurs
  const handleInputChange = (field: keyof RegisterFormData) => (value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Réinitialiser les erreurs de validation quand l'utilisateur modifie quelque chose
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Fonction de validation simple
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Champs de base obligatoires
    if (!formData.role) errors.push('Veuillez sélectionner votre profil');
    if (!formData.prenom.trim()) errors.push('Le prénom est obligatoire');
    if (!formData.nom.trim()) errors.push('Le nom est obligatoire');
    if (!formData.telephone.trim()) errors.push('Le téléphone est obligatoire');
    if (!formData.adresse.trim()) errors.push('L\'adresse est obligatoire');
    if (!formData.ville.trim()) errors.push('La ville est obligatoire');
    if (!formData.codePostal.trim()) errors.push('Le code postal est obligatoire');

    // Validation email
    if (!formData.email.trim()) {
      errors.push('L\'email est obligatoire');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    // Validation mot de passe
    if (!formData.motDePasse) {
      errors.push('Le mot de passe est obligatoire');
    } else {
      if (formData.motDePasse.length < 8) errors.push('Le mot de passe doit contenir au moins 8 caractères');
      if (!/[A-Z]/.test(formData.motDePasse)) errors.push('Le mot de passe doit contenir au moins une majuscule');
      if (!/\d/.test(formData.motDePasse)) errors.push('Le mot de passe doit contenir au moins un chiffre');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.motDePasse)) errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Validation selon le rôle
    switch (formData.role) {
      case 'LIVREUR':
        if (!formData.vehicule?.trim()) errors.push('Le type de véhicule est obligatoire pour un livreur');
        if (!formData.permisVerif) errors.push('La certification du permis est obligatoire pour un livreur');
        break;

      case 'COMMERCANT':
        if (!formData.siret?.trim()) {
          errors.push('Le numéro SIRET est obligatoire pour un commerçant');
        } else if (!/^\d{14}$/.test(formData.siret)) {
          errors.push('Le numéro SIRET doit contenir exactement 14 chiffres');
        }
        break;

      case 'PRESTATAIRE':
        if (!formData.typeService?.trim()) errors.push('Le type de service est obligatoire pour un prestataire');
        if (!formData.tarifHoraire || formData.tarifHoraire <= 0) {
          errors.push('Le tarif horaire doit être supérieur à 0 pour un prestataire');
        }
        break;
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);

    // Validation côté frontend
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Plus de connexion automatique - redirection vers vérification email
        const userId = data.userId;
        const email = formData.email;
        
        // Redirection vers la page de vérification avec les paramètres
        navigate(`/verify-email?userId=${userId}&email=${encodeURIComponent(email)}`);
      } else {
        setError(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'LIVREUR':
        return (
          <>
            <Input
              label="Type de véhicule"
              type="text"
              value={formData.vehicule || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, vehicule: value }))}
              placeholder="Ex: Vélo, Voiture, Scooter..."
              required
            />
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="permisVerif"
                id="permisVerif"
                checked={formData.permisVerif || false}
                onChange={handleCheckboxChange}
                required
              />
              <label className="form-check-label" htmlFor="permisVerif">
                Je certifie que mon permis de conduire est valide *
              </label>
            </div>
          </>
        );

      case 'COMMERCANT':
        return (
          <Input
            label="Numéro SIRET"
            type="text"
            value={formData.siret || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, siret: value }))}
            placeholder="14 chiffres"
            required
          />
        );

      case 'PRESTATAIRE':
        return (
          <>
            <Input
              label="Type de service"
              type="text"
              value={formData.typeService || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, typeService: value }))}
              placeholder="Ex: Jardinage, Ménage, Garde d'animaux..."
              required
            />
            <Input
              label="Tarif horaire (€)"
              type="number"
              value={formData.tarifHoraire?.toString() || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, tarifHoraire: parseFloat(value) || 0 }))}
              placeholder="Ex: 15.50"
              required
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card title="Inscription EcoDeli">
            {error && (
              <Alert type="danger">
                {error}
              </Alert>
            )}

            {validationErrors.length > 0 && (
              <Alert type="warning">
                <div className="fw-bold mb-2">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Veuillez corriger les erreurs suivantes :
                </div>
                <ul className="mb-0 ps-3">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Choix du rôle */}
              <div className="mb-3">
                <label className="form-label fw-bold">Je suis un(e) *</label>
                <select
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Sélectionnez votre profil</option>
                  <option value="CLIENT">Client - J'ai des colis à expédier</option>
                  <option value="LIVREUR">Livreur - Je veux livrer des colis</option>
                  <option value="COMMERCANT">Commerçant - Je veux proposer mes services</option>
                  <option value="PRESTATAIRE">Prestataire - J'offre des services à la personne</option>
                </select>
              </div>

              {/* Champs de base */}
              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="Prénom"
                    type="text"
                    value={formData.prenom}
                    onChange={(value) => setFormData(prev => ({ ...prev, prenom: value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Nom"
                    type="text"
                    value={formData.nom}
                    onChange={(value) => setFormData(prev => ({ ...prev, nom: value }))}
                    required
                  />
                </div>
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />

              <PasswordStrengthInput
                label="Mot de passe"
                value={formData.motDePasse}
                onChange={handleInputChange('motDePasse')}
                required
              />

              <Input
                label="Téléphone"
                type="tel"
                value={formData.telephone}
                onChange={handleInputChange('telephone')}
                placeholder="Ex: 06 12 34 56 78"
                required
              />

              {/* Section Adresse */}
              <div className="mt-4">
                <h5 className="text-primary mb-3">
                  <i className="bi bi-geo-alt me-2"></i>
                  Adresse
                </h5>
                
                <AddressInput
                  label="Adresse complète"
                  value={formData.adresse}
                  onChange={(value) => setFormData(prev => ({ ...prev, adresse: value }))}
                  onCityChange={(city) => setFormData(prev => ({ ...prev, ville: city }))}
                  placeholder="Saisissez votre adresse complète"
                  required
                />

                <div className="row">
                  <div className="col-md-8">
                    <Input
                      label="Ville"
                      type="text"
                      value={formData.ville}
                      onChange={(value) => setFormData(prev => ({ ...prev, ville: value }))}
                      placeholder="Ville"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <Input
                      label="Code postal"
                      type="text"
                      value={formData.codePostal}
                      onChange={(value) => setFormData(prev => ({ ...prev, codePostal: value }))}
                      placeholder="75001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Champs spécifiques selon le rôle */}
              {formData.role && (
                <div className="mt-4">
                  <h5 className="text-primary mb-3">Informations spécifiques</h5>
                  {renderRoleSpecificFields()}
                </div>
              )}

              <div className="d-grid gap-2 mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading || !formData.role}
                >
                  {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                </Button>
              </div>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                Déjà membre ? <a href="/login" className="text-primary">Se connecter</a>
              </small>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
