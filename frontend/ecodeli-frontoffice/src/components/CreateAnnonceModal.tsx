import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import AddressInput from './ui/AddressInput';
import Button from './ui/Button';
import Stepper from './ui/Stepper';
import PhotoUpload from './ui/PhotoUpload';
import { CreateAnnonceData } from '../types';
import { annonceApi, photoApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import GoogleMapsService from '../services/googleMaps';
import { DistanceCalculationResult } from '../types/google';

const typeOptions = [
  { value: 'LIVRAISON_COLIS', label: 'Livraison de colis' },
  { value: 'COURSES', label: 'Courses' },
  { value: 'TRANSPORT_PERSONNE', label: 'Transport de personne' },
  { value: 'SERVICE_PERSONNE', label: 'Service à la personne' },
  { value: 'ACHAT_ETRANGER', label: 'Achat à l\'étranger' }
];

const initialState: CreateAnnonceData = {
  titre: '',
  description: '',
  type: 'LIVRAISON_COLIS',
  adresseDepart: '',
  adresseArrivee: '',
  villeDepart: '',
  villeArrivee: '',
  prixPropose: undefined,
  prixNegociable: undefined,
  dateLimite: '',
  datePreferee: '',
  typeColis: '',
  poids: undefined,
  dimensions: '',
  fragile: false,
  photoUrl: ''
};

const steps = [
  { id: 'basic', title: 'Type & Description', description: 'Informations de base' },
  { id: 'photo', title: 'Photo', description: 'Image de l\'annonce' },
  { id: 'location', title: 'Localisation', description: 'Adresses' },
  { id: 'details', title: 'Détails', description: 'Prix et spécificités' },
  { id: 'summary', title: 'Récapitulatif', description: 'Validation finale' }
];

interface CreateAnnonceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAnnonceModal: React.FC<CreateAnnonceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [form, setForm] = useState<CreateAnnonceData>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<DistanceCalculationResult | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  // Calculer la distance et le prix estimé quand les adresses changent
  useEffect(() => {
    const calculateDistance = async () => {
      // Amélioration: Calcul plus intelligent avec les nouvelles adresses précises
      if (form.adresseDepart && form.adresseArrivee && 
          form.villeDepart && form.villeArrivee &&
          form.adresseDepart.length > 5 && form.adresseArrivee.length > 5) {
        
        console.log('🧮 Calcul de distance entre:', form.adresseDepart, 'et', form.adresseArrivee);
        setCalculatingDistance(true);
        
        try {
          const result = await GoogleMapsService.calculateDistanceAndPrice(
            form.adresseDepart,
            form.adresseArrivee
          );
          
          console.log('📊 Résultat du calcul:', result);
          setDistanceInfo(result);
          
          // Amélioration: Suggestion intelligente du prix
          if (result.success && result.estimatedPrice) {
            // Si l'utilisateur n'a pas encore touché au prix, on le suggère
            if (form.prixPropose === undefined || form.prixPropose === result.estimatedPrice) {
              setForm(f => ({ ...f, prixPropose: result.estimatedPrice }));
              console.log('💰 Prix suggéré automatiquement:', result.estimatedPrice);
            }
          }
          
        } catch (error) {
          console.error('❌ Erreur calcul distance:', error);
          setDistanceInfo({ success: false, error: 'Erreur de calcul de distance' });
        } finally {
          setCalculatingDistance(false);
        }
      } else {
        // Reset si les conditions ne sont pas remplies
        setDistanceInfo(null);
        setCalculatingDistance(false);
      }
    };

    // Debounce amélioré pour une meilleure performance
    const timeoutId = setTimeout(calculateDistance, 800);
    return () => clearTimeout(timeoutId);
  }, [form.adresseDepart, form.adresseArrivee, form.villeDepart, form.villeArrivee]);

  // Validation par étape
  const validateStep = (stepIndex: number): boolean => {
    setError(null);
    
    switch (stepIndex) {
      case 0: // Basic info
        if (!form.titre || !form.description || !form.type) {
          setError('Merci de remplir tous les champs obligatoires.');
          return false;
        }
        return true;
      case 1: // Photo (optionnelle)
        return true;
      case 2: // Location
        if (!form.adresseDepart || !form.villeDepart || !form.adresseArrivee || !form.villeArrivee) {
          setError('Merci de remplir toutes les adresses.');
          return false;
        }
        return true;
      case 3: // Details (optionnels)
        return true;
      case 4: // Summary
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
    setError(null);
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
      setError(null);
    }
  };

  const handlePhotoUpload = async (file: File): Promise<string> => {
    const response = await photoApi.uploadAnnoncePhoto(file, currentUser?.user.id || 0);
    const photoUrl = response.url;
    console.log('Photo uploadée, URL reçue:', photoUrl);
    setForm(f => {
      const newForm = { ...f, photoUrl };
      console.log('Form mis à jour avec photo:', newForm);
      return newForm;
    });
    return photoUrl;
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      // Préparer les données avec les bons formats
      const formData = {
        ...form,
        // S'assurer que les champs vides sont null plutôt que des strings vides
        dateLimite: form.dateLimite || null,
        datePreferee: form.datePreferee || null,
        typeColis: form.typeColis || null,
        dimensions: form.dimensions || null,
        photoUrl: form.photoUrl || null
      };

      console.log('Données à envoyer pour création annonce:', formData);
      console.log('PhotoUrl dans les données:', formData.photoUrl);

      await annonceApi.create(formData, currentUser?.user.id || 0);
      
      // Afficher le toast de succès
      showSuccess('Annonce créée avec succès ! Elle est maintenant visible par les livreurs.');
      
      // Réinitialiser le formulaire
      setForm(initialState);
      setCurrentStep(0);
      setCompletedSteps([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erreur création annonce:', err);
      showError('Erreur lors de la création de l\'annonce: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm(initialState);
      setCurrentStep(0);
      setCompletedSteps([]);
      setError(null);
      onClose();
    }
  };

  // Rendu des étapes
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic info
        return (
          <div>
            <h5 className="mb-3">Informations de base</h5>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">Type d'annonce *</label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                required
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Titre"
              value={form.titre}
              onChange={value => setForm(f => ({ ...f, titre: value }))}
              required
            />
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                required
              />
            </div>
          </div>
        );

      case 1: // Photo
        return (
          <div>
            <h5 className="mb-3">Photo de l'annonce</h5>
            <p className="text-muted mb-3">Ajoutez une photo pour rendre votre annonce plus attractive (optionnel).</p>
            <PhotoUpload
              onUpload={handlePhotoUpload}
              onRemove={() => setForm(f => ({ ...f, photoUrl: '' }))}
              currentPhotoUrl={form.photoUrl}
            />
          </div>
        );

      case 2: // Location
        return (
          <div>
            <h5 className="mb-3">
              <i className="bi bi-geo-alt me-2"></i>
              Localisation
            </h5>
            
            {/* Indication sur l'autocomplétion */}
            <div className="alert alert-info d-flex align-items-center mb-4">
              <i className="bi bi-lightbulb me-2"></i>
              <div>
                <strong>Astuce :</strong> Utilisez l'autocomplétion Google Places pour sélectionner des adresses précises. 
                La distance et le prix seront calculés automatiquement !
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <AddressInput
                  label="Adresse de départ"
                  value={form.adresseDepart}
                  onChange={value => setForm(f => ({ ...f, adresseDepart: value }))}
                  onCityChange={city => {
                    console.log('🏙️ Ville départ mise à jour:', city);
                    setForm(f => ({ ...f, villeDepart: city || '' }));
                  }}
                  placeholder="Ex: 1 rue de Rivoli, Paris"
                  required
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Ville de départ"
                  value={form.villeDepart}
                  onChange={value => setForm(f => ({ ...f, villeDepart: value }))}
                  placeholder="Auto-rempli par l'adresse"
                  required
                />
              </div>
            </div>
            
            <div className="d-flex justify-content-center my-3">
              <i className="bi bi-arrow-down text-primary" style={{ fontSize: '1.5rem' }}></i>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <AddressInput
                  label="Adresse d'arrivée"
                  value={form.adresseArrivee}
                  onChange={value => setForm(f => ({ ...f, adresseArrivee: value }))}
                  onCityChange={city => {
                    console.log('🏙️ Ville arrivée mise à jour:', city);
                    setForm(f => ({ ...f, villeArrivee: city || '' }));
                  }}
                  placeholder="Ex: Gare de Lyon, Paris"
                  required
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Ville d'arrivée"
                  value={form.villeArrivee}
                  onChange={value => setForm(f => ({ ...f, villeArrivee: value }))}
                  placeholder="Auto-rempli par l'adresse"
                  required
                />
              </div>
            </div>

            {/* Informations de distance et prix estimé améliorées */}
            {(calculatingDistance || distanceInfo) && (
              <div className="mt-4">
                <div className="card border-primary">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0 d-flex align-items-center">
                      <i className="bi bi-calculator me-2"></i>
                      Calcul automatique Google Maps
                      {calculatingDistance && (
                        <div className="spinner-border spinner-border-sm ms-auto" role="status">
                          <span className="visually-hidden">Calcul...</span>
                        </div>
                      )}
                    </h6>
                  </div>
                  <div className="card-body">
                    {calculatingDistance && (
                      <div className="d-flex align-items-center text-muted justify-content-center py-3">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Calcul en cours...</span>
                        </div>
                        Calcul précis de la distance et du prix estimé...
                      </div>
                    )}
                    
                    {distanceInfo && !calculatingDistance && (
                      <div>
                        {distanceInfo.success ? (
                          <>
                            <div className="row text-center mb-3">
                              <div className="col-md-4">
                                <div className="p-3 bg-light rounded">
                                  <i className="bi bi-geo-alt text-primary" style={{fontSize: '2rem'}}></i>
                                  <div className="fw-bold fs-5">{GoogleMapsService.formatDistance(distanceInfo.distance!)}</div>
                                  <small className="text-muted">Distance totale</small>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <div className="p-3 bg-light rounded">
                                  <i className="bi bi-clock text-info" style={{fontSize: '2rem'}}></i>
                                  <div className="fw-bold fs-5">{GoogleMapsService.formatDuration(distanceInfo.duration!)}</div>
                                  <small className="text-muted">Temps de trajet</small>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <div className="p-3 bg-success-light rounded border border-success">
                                  <i className="bi bi-currency-euro text-success" style={{fontSize: '2rem'}}></i>
                                  <div className="fw-bold fs-4 text-success">{GoogleMapsService.formatPrice(distanceInfo.estimatedPrice!)}</div>
                                  <small className="text-success">Prix suggéré</small>
                                </div>
                              </div>
                            </div>
                            
                            <div className="alert alert-success d-flex align-items-center">
                              <i className="bi bi-check-circle me-2"></i>
                              <div>
                                <strong>Calcul réussi !</strong> Le prix suggéré sera automatiquement proposé à l'étape suivante.
                                Vous pourrez bien sûr le modifier si nécessaire.
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="alert alert-warning d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            <div>
                              <strong>Calcul impossible :</strong> {distanceInfo.error || 'Vérifiez que les adresses sont complètes et valides.'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Information sur la formule de calcul */}
                    {!calculatingDistance && (
                      <div className="mt-3 pt-3 border-top">
                        {GoogleMapsService.isAvailable() ? (
                          <small className="text-muted d-flex align-items-center">
                            <i className="bi bi-info-circle me-2"></i>
                            <div>
                              <strong>Formule de calcul :</strong> 5€ (forfait de base) + 0,80€/km + 0,15€/minute
                              <br />
                              <em>Calcul basé sur les données Google Maps en temps réel</em>
                            </div>
                          </small>
                        ) : (
                          <small className="text-warning d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Google Maps non disponible - Le calcul automatique est désactivé
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Details
        return (
          <div>
            <h5 className="mb-3">Détails et prix</h5>
            <div className="row">
              <div className="col-md-6">
                <Input
                  label="Prix proposé (€)"
                  type="number"
                  value={form.prixPropose !== undefined ? String(form.prixPropose) : ''}
                  onChange={value => setForm(f => ({ ...f, prixPropose: value === '' ? undefined : Number(value) }))}
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Prix négociable (€)"
                  type="number"
                  value={form.prixNegociable !== undefined ? String(form.prixNegociable) : ''}
                  onChange={value => setForm(f => ({ ...f, prixNegociable: value === '' ? undefined : Number(value) }))}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="dateLimite" className="form-label">Date limite</label>
                  <input
                    type="date"
                    className="form-control"
                    id="dateLimite"
                    name="dateLimite"
                    value={form.dateLimite || ''}
                    onChange={e => setForm(f => ({ ...f, dateLimite: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="datePreferee" className="form-label">Date préférée</label>
                  <input
                    type="date"
                    className="form-control"
                    id="datePreferee"
                    name="datePreferee"
                    value={form.datePreferee || ''}
                    onChange={e => setForm(f => ({ ...f, datePreferee: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            {/* Champs spécifiques COLIS */}
            {form.type === 'LIVRAISON_COLIS' && (
              <>
                <h6 className="mt-4 mb-3">Détails du colis</h6>
                <Input
                  label="Type de colis"
                  value={form.typeColis || ''}
                  onChange={value => setForm(f => ({ ...f, typeColis: value }))}
                />
                <div className="row">
                  <div className="col-md-6">
                    <Input
                      label="Poids (kg)"
                      type="number"
                      value={form.poids !== undefined ? String(form.poids) : ''}
                      onChange={value => setForm(f => ({ ...f, poids: value === '' ? undefined : Number(value) }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      label="Dimensions (L x l x h cm)"
                      value={form.dimensions || ''}
                      onChange={value => setForm(f => ({ ...f, dimensions: value }))}
                    />
                  </div>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="fragile"
                    name="fragile"
                    checked={form.fragile || false}
                    onChange={e => setForm(f => ({ ...f, fragile: e.target.checked }))}
                  />
                  <label className="form-check-label" htmlFor="fragile">
                    Colis fragile
                  </label>
                </div>
              </>
            )}
          </div>
        );

      case 4: // Summary
        return (
          <div>
            <h5 className="mb-3">Récapitulatif</h5>
            <div className="row">
              {form.photoUrl && (
                <div className="col-md-4 mb-3">
                  <img 
                    src={form.photoUrl} 
                    alt="Photo de l'annonce" 
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className={form.photoUrl ? 'col-md-8' : 'col-md-12'}>
                <div className="mb-2"><strong>Type :</strong> {typeOptions.find(opt => opt.value === form.type)?.label}</div>
                <div className="mb-2"><strong>Titre :</strong> {form.titre}</div>
                <div className="mb-2"><strong>Description :</strong> {form.description}</div>
                <div className="mb-2"><strong>Départ :</strong> {form.adresseDepart}, {form.villeDepart}</div>
                <div className="mb-2"><strong>Arrivée :</strong> {form.adresseArrivee}, {form.villeArrivee}</div>
                {form.prixPropose && <div className="mb-2"><strong>Prix proposé :</strong> {form.prixPropose}€</div>}
                {form.dateLimite && <div className="mb-2"><strong>Date limite :</strong> {form.dateLimite}</div>}
                {form.type === 'LIVRAISON_COLIS' && form.typeColis && <div className="mb-2"><strong>Type de colis :</strong> {form.typeColis}</div>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer une nouvelle annonce"
      size="lg"
    >
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />

      {renderStepContent()}

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      
      <div className="d-flex justify-content-between mt-4">
        <div>
          {currentStep > 0 && (
            <Button 
              variant="secondary" 
              onClick={handlePrevious}
              disabled={loading}
            >
              Précédent
            </Button>
          )}
        </div>
        
        <div className="d-flex gap-2">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              variant="primary" 
              onClick={handleNext}
              disabled={loading}
            >
              Suivant
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer l\'annonce'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateAnnonceModal;
