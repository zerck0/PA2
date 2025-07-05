import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { CreateAnnonceCommercantData } from '../types';

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

          {/* Adresses */}
          <div className="mb-4">
            <h6 className="text-primary mb-3">
              <i className="bi bi-geo-alt me-2"></i>
              Adresses
            </h6>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Adresse de départ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.adresseDepart}
                    onChange={(e) => handleInputChange('adresseDepart', e.target.value)}
                    required
                    placeholder="Adresse du magasin/commerce"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Ville de départ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.villeDepart}
                    onChange={(e) => handleInputChange('villeDepart', e.target.value)}
                    required
                    placeholder="Ville"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Adresse de livraison</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.adresseArrivee}
                    onChange={(e) => handleInputChange('adresseArrivee', e.target.value)}
                    required
                    placeholder="Adresse de livraison"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Ville de livraison</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.villeArrivee}
                    onChange={(e) => handleInputChange('villeArrivee', e.target.value)}
                    required
                    placeholder="Ville"
                  />
                </div>
              </div>
            </div>
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
