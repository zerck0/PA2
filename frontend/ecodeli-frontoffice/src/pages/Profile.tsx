import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import PhotoUpload from '../components/ui/PhotoUpload';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { userApi, profilPublicApi, photoApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { getRoleLabel } from '../utils/helpers';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    prenom: currentUser?.user.prenom || '',
    nom: currentUser?.user.nom || '',
    email: currentUser?.user.email || '',
    telephone: ''
  });

  // État pour le profil public (livreur/prestataire)
  const [profilPublic, setProfilPublic] = useState({
    biographie: '',
    photoProfilUrl: ''
  });
  const [loadingProfil, setLoadingProfil] = useState(false);
  
  const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  
  const { 
    loading, 
    execute: updateProfile 
  } = useApi(userApi.updateProfile);

  // Charger les données du profil public si livreur ou prestataire
  useEffect(() => {
    const loadProfilPublic = async () => {
      if (!currentUser || (currentUser.user.role !== 'LIVREUR' && currentUser.user.role !== 'PRESTATAIRE')) {
        return;
      }

      try {
        let profilData;
        if (currentUser.user.role === 'LIVREUR') {
          profilData = await profilPublicApi.getLivreur(currentUser.user.id);
        } else {
          profilData = await profilPublicApi.getPrestataire(currentUser.user.id);
        }

        setProfilPublic({
          biographie: profilData.biographie || '',
          photoProfilUrl: profilData.photoProfilUrl || ''
        });
      } catch (error) {
        console.error('Erreur lors du chargement du profil public:', error);
      }
    };

    loadProfilPublic();
  }, [currentUser]);

  // Fonction pour gérer la mise à jour du profil public
  const handleUpdateProfilPublic = async () => {
    if (!currentUser) return;

    setLoadingProfil(true);
    try {
      // Créer un objet simple avec seulement les champs nécessaires
      const updateData = {
        biographie: profilPublic.biographie || '',
        photoProfilUrl: profilPublic.photoProfilUrl || ''
      };

      if (currentUser.user.role === 'LIVREUR') {
        await profilPublicApi.updateLivreur(currentUser.user.id, updateData);
      } else {
        await profilPublicApi.updatePrestataire(currentUser.user.id, updateData);
      }
      showSuccess('Profil public mis à jour avec succès !');
    } catch (error: any) {
      showError('Erreur lors de la mise à jour du profil public');
    } finally {
      setLoadingProfil(false);
    }
  };

  // Fonction pour gérer l'upload de photo (exactement comme dans CreateAnnonceModal)
  const handlePhotoUpload = async (file: File): Promise<string> => {
    try {
      const response = await photoApi.uploadAnnoncePhoto(file, currentUser!.user.id);
      const photoUrl = response.url || response; // Support des deux formats de réponse
      
      console.log('Photo uploadée, URL reçue:', photoUrl);
      
      setProfilPublic(prev => {
        const newProfile = { ...prev, photoProfilUrl: photoUrl };
        console.log('Profil mis à jour avec photo:', newProfile);
        return newProfile;
      });
      
      showSuccess('Photo uploadée avec succès !');
      return photoUrl;
    } catch (error: any) {
      console.error('Erreur upload photo:', error);
      showError(error.message || 'Erreur lors de l\'upload de la photo');
      throw error;
    }
  };

  // Fonction pour supprimer la photo
  const handlePhotoRemove = () => {
    setProfilPublic(prev => ({ ...prev, photoProfilUrl: '' }));
  };

  // Vérifier si l'utilisateur peut avoir un profil public
  const canHavePublicProfile = () => {
    return currentUser?.user.role === 'LIVREUR' || currentUser?.user.role === 'PRESTATAIRE';
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center">
          <p>Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </Layout>
    );
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      setAlert({ type: 'success', message: 'Profil mis à jour avec succès !' });
    } catch (error: any) {
      setAlert({ type: 'danger', message: error.message || 'Erreur lors de la mise à jour du profil' });
    }
  };

  return (
    <Layout>
      <h2 className="mb-4">Mon Profil</h2>
      
      <Card>
        {alert && (
          <Alert type={alert.type} onClose={() => setAlert(null)} className="mb-4">
            {alert.message}
          </Alert>
        )}
        
        <div className="mb-4">
          <h5>Rôle: {getRoleLabel(currentUser.user.role)}</h5>
          <p className="text-muted">ID: {currentUser.user.id}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={handleChange('prenom')}
                required
              />
            </div>
            <div className="col-md-6">
              <Input
                label="Nom"
                value={formData.nom}
                onChange={handleChange('nom')}
                required
              />
            </div>
          </div>
          
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange('email')}
            required
          />
          
          <Input
            type="tel"
            label="Téléphone"
            value={formData.telephone}
            onChange={handleChange('telephone')}
          />
          
          <div className="d-flex justify-content-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Section profil public pour livreurs et prestataires */}
      {canHavePublicProfile() && (
        <Card className="mt-4">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Profil public {currentUser.user.role === 'LIVREUR' ? 'Livreur' : 'Prestataire'}
              </h5>
              <Button
                variant="outline-primary"
                onClick={() => window.open(`/profil-public/${currentUser.user.role.toLowerCase()}/${currentUser.user.id}`, '_blank')}
                className="btn-sm"
              >
                <i className="bi bi-eye me-2"></i>
                Voir mon profil public
              </Button>
            </div>
          </div>
          
          <div className="card-body">
            <p className="text-muted mb-4">
              Votre profil public sera visible par les clients. Une photo et une biographie attrayantes 
              vous aideront à obtenir plus de{' '}
              {currentUser.user.role === 'LIVREUR' ? 'livraisons' : 'prestations'}.
            </p>

            <div className="row">
              {/* Section photo de profil */}
              <div className="col-md-4">
                <div className="text-center">
                  <label className="form-label fw-bold">Photo de profil</label>
                  
                  {/* Aperçu de la photo actuelle */}
                  <div className="mb-3">
                    {profilPublic.photoProfilUrl ? (
                      <img
                        src={profilPublic.photoProfilUrl}
                        alt="Photo de profil actuelle"
                        className="rounded-circle border"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-light border d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: '120px', height: '120px' }}
                      >
                        <i className="bi bi-person-fill text-muted" style={{ fontSize: '2rem' }}></i>
                      </div>
                    )}
                  </div>

                  {/* Upload de photo */}
                  <PhotoUpload
                    onUpload={handlePhotoUpload}
                    onRemove={handlePhotoRemove}
                    currentPhotoUrl={profilPublic.photoProfilUrl}
                  />
                </div>
              </div>

              {/* Section biographie */}
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Biographie personnelle
                    <span className="text-muted fw-normal"> (optionnel)</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={profilPublic.biographie}
                    onChange={(e) => setProfilPublic({
                      ...profilPublic,
                      biographie: e.target.value
                    })}
                    placeholder={`Présentez-vous aux clients ! Parlez de votre expérience, vos spécialités, votre motivation en tant que ${currentUser.user.role === 'LIVREUR' ? 'livreur' : 'prestataire'}...`}
                    maxLength={1000}
                  />
                  <div className="form-text text-end">
                    {profilPublic.biographie.length}/1000 caractères
                  </div>
                </div>

                {/* Conseils */}
                <div className="alert alert-info">
                  <h6 className="alert-heading">
                    <i className="bi bi-lightbulb me-2"></i>
                    Conseils pour un profil attractif
                  </h6>
                  <ul className="mb-0 small">
                    <li>Utilisez une photo de profil professionnelle et souriante</li>
                    <li>Décrivez votre expérience et vos points forts</li>
                    <li>Mentionnez vos spécialités ou zones de couverture</li>
                    <li>Restez authentique et professionnel</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="primary"
                onClick={handleUpdateProfilPublic}
                disabled={loadingProfil}
              >
                {loadingProfil ? 'Enregistrement...' : 'Enregistrer le profil public'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </Layout>
  );
};

export default Profile;
