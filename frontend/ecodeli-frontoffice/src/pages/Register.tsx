import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';

interface RegisterFormData {
  role: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
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
    permisVerif: false
  });

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

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
                onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                required
              />

              <Input
                label="Mot de passe"
                type="password"
                value={formData.motDePasse}
                onChange={(value) => setFormData(prev => ({ ...prev, motDePasse: value }))}
                placeholder="Au moins 6 caractères"
                required
              />

              <Input
                label="Téléphone"
                type="tel"
                value={formData.telephone}
                onChange={(value) => setFormData(prev => ({ ...prev, telephone: value }))}
                placeholder="Ex: 06 12 34 56 78"
                required
              />

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
