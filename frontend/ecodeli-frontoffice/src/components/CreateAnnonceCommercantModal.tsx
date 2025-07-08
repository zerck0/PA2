import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import AddressInput from './ui/AddressInput';
import { CreateAnnonceCommercantData } from '../types';
import GoogleMapsService from '../services/googleMaps';
import { DistanceCalculationResult } from '../types/google';

interface CreateAnnonceCommercantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (annonceData: CreateAnnonceCommercantData) => void;
}

const CreateAnnonceCommercantModal: React.FC<CreateAnnonceCommercantModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState<CreateAnnonceCommercantData>({
    titre: '',
    description: '',
    adresseDepart: '',
    adresseArrivee: '',
    villeDepart: '',
    villeArrivee: '',
    listeCourses: '',
    quantiteProduits: 0,
    prixPropose: 0,
    reserveAuxAffilies: true,
    dateLimite: undefined,
    datePreferee: undefined
  });

  const [loading, setLoading] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<DistanceCalculationResult | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  // Calculer la distance et le prix estimé quand les adresses changent
  useEffect(() => {
    const calculateDistance = async () => {
      if (formData.adresseDepart && formData.adresseArrivee && 
          formData.villeDepart && formData.villeArrivee &&
          formData.adresseDepart.length > 5 && formData.adresseArrivee.length > 5) {
        
        setCalculatingDistance(true);
        
        try {
          const result = await GoogleMapsService.calculateDistanceAndPrice(
            formData.adresseDepart,
            formData.adresseArrivee
          );
          
          setDistanceInfo(result);
          
          // Suggestion intelligente du prix
          if (result.success && result.estimatedPrice) {
            if (formData.prixPropose === 0 || formData.prixPropose === result.estimatedPrice) {
              setFormData(prev => ({ ...prev, prixPropose: result.estimatedPrice! }));
            }
          }
          
        } catch (error) {
          console.error('Erreur calcul distance:', error);
          setDistanceInfo({ success: false, error: 'Erreur de calcul de distance' });
        } finally {
          setCalculatingDistance(false);
        }
      } else {
        setDistanceInfo(null);
        setCalculatingDistance(false);
      }
    };

    const timeoutId = setTimeout(calculateDistance, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.adresseDepart, formData.adresseArrivee, formData.villeDepart, formData.villeArrivee]);

  const handleInputChange = (field: keyof CreateAnnonceCommercantData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (type: 'depart' | 'arrivee', address: string, city: string) => {
    if (type === 'depart') {
      setFormData(prev => ({
        ...prev,
        adresseDepart: address,
        villeDepart: city
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        adresseArrivee: address,
        villeArrivee: city
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreate(formData);
      // Reset form après création réussie
      setFormData({
        titre: '',
        description: '',
        adresseDepart: '',
        adresseArrivee: '',
        villeDepart: '',
        villeArrivee: '',
        listeCourses: '',
        quantiteProduits: 0,
        prixPropose: 0,
        reserveAuxAffilies: true,
        dateLimite: '',
        datePreferee: ''
      });
    } catch (error) {
      // L'erreur est gérée dans le parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer une annonce commerçant"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Informations générales */}
          <div className="mb-4">
            <h6 className="text-primary mb-3">
              <i className="bi bi-info-circle me-2"></i>
              Informations générales
            </h6>
            
            <div className="mb-3">
              <label className="form-label">Titre de l'annonce</label>
              <input
                type="text"
                className="form-control"
                value={formData.titre}
                onChange={(e) => handleInputChange('titre', e.target.value)}
                required
                placeholder="Ex: Livraison courses hebdomadaires"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                placeholder="Décrivez votre demande de livraison..."
              />
            </div>
          </div>

          {/* Liste des courses */}
          <div className="mb-4">
            <h6 className="text-primary mb-3">
              <i className="bi bi-cart me-2"></i>
              Liste des courses
            </h6>
            
            <div className="mb-3">
              <label className="form-label">Produits à acheter/livrer</label>
              <textarea
                className="form-control"
                rows={4}
                value={formData.listeCourses}
                onChange={(e) => handleInputChange('listeCourses', e.target.value)}
                required
                placeholder="Ex: 
- 2 kg de pommes
- 1 bouteille de lait
- Pain complet
- Fromage gruyère..."
              />
              <div className="form-text">
                Listez les produits ligne par ligne pour plus de clarté
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Nombre d'articles (estimation)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantiteProduits?.toString() || ''}
                  onChange={(e) => handleInputChange('quantiteProduits', parseInt(e.target.value) || 0)}
                  placeholder="10"
                  min="0"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Prix proposé (€)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.prixPropose?.toString() || ''}
                  onChange={(e) => handleInputChange('prixPropose', parseFloat(e.target.value) || 0)}
                  required
                  placeholder="25.00"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Adresses avec Google Places */}
          <div className="mb-4">
            <h6 className="text-primary mb-3">
              <i className="bi bi-geo-alt me-2"></i>
              Adresses
            </h6>
            
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
                  value={formData.adresseDepart}
                  onChange={value => handleInputChange('adresseDepart', value)}
                  onCityChange={city => {
                    handleInputChange('villeDepart', city || '');
                  }}
                  placeholder="Ex: 15 rue du Commerce, Paris"
                  required
                />
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Ville de départ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.villeDepart}
                    onChange={(e) => handleInputChange('villeDepart', e.target.value)}
                    placeholder="Auto-rempli par l'adresse"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-center my-3">
              <i className="bi bi-arrow-down text-primary" style={{ fontSize: '1.5rem' }}></i>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <AddressInput
                  label="Adresse de livraison"
                  value={formData.adresseArrivee}
                  onChange={value => handleInputChange('adresseArrivee', value)}
                  onCityChange={city => {
                    handleInputChange('villeArrivee', city || '');
                  }}
                  placeholder="Ex: 25 avenue des Clients, Paris"
                  required
                />
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Ville de livraison</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.villeArrivee}
                    onChange={(e) => handleInputChange('villeArrivee', e.target.value)}
                    placeholder="Auto-rempli par l'adresse"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Informations de distance et prix estimé */}
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
                                <strong>Calcul réussi !</strong> Le prix suggéré est automatiquement appliqué.
                                Vous pouvez le modifier si nécessaire.
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

          {/* Options */}
          <div className="mb-4">
            <h6 className="text-primary mb-3">
              <i className="bi bi-gear me-2"></i>
              Options
            </h6>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="reserveAuxAffilies"
                  checked={formData.reserveAuxAffilies}
                  onChange={(e) => handleInputChange('reserveAuxAffilies', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="reserveAuxAffilies">
                  <strong>Réservé aux livreurs affiliés EcoDeli</strong>
                  <div className="form-text">
                    Recommandé pour garantir la qualité du service
                  </div>
                </label>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Date limite (optionnel)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dateLimite || ''}
                    onChange={(e) => handleInputChange('dateLimite', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Date préférée (optionnel)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.datePreferee || ''}
                    onChange={(e) => handleInputChange('datePreferee', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          {formData.titre && (
            <div className="alert alert-light">
              <h6 className="alert-heading">
                <i className="bi bi-eye me-2"></i>
                Aperçu de votre annonce
              </h6>
              <p className="mb-2"><strong>{formData.titre}</strong></p>
              <p className="mb-2">{formData.description}</p>
              <div className="d-flex justify-content-between text-muted small">
                <span>
                  <i className="bi bi-geo-alt me-1"></i>
                  {formData.villeDepart} → {formData.villeArrivee}
                </span>
                <span>
                  <i className="bi bi-currency-euro me-1"></i>
                  {formData.prixPropose}€
                </span>
                <span>
                  <i className="bi bi-box me-1"></i>
                  {formData.quantiteProduits} articles
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.titre || !formData.listeCourses || !formData.adresseDepart || !formData.adresseArrivee}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Création en cours...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2"></i>
                Créer l'annonce
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAnnonceCommercantModal;
