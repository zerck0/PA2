import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { affiliationApi } from '../services/api';
import { StatutAffiliationResponse } from '../types';

const AffiliationCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [statutAffiliation, setStatutAffiliation] = useState<StatutAffiliationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  // Charger le statut d'affiliation au montage du composant
  useEffect(() => {
    if (currentUser?.user.id && currentUser.user.role === 'LIVREUR') {
      loadStatutAffiliation();
    }
  }, [currentUser]);

  const loadStatutAffiliation = async () => {
    if (!currentUser?.user.id) return;
    
    try {
      const statut = await affiliationApi.getStatutAffiliation(currentUser.user.id);
      setStatutAffiliation(statut);
    } catch (error) {
      console.error('Erreur lors du chargement du statut d\'affiliation:', error);
    }
  };

  const handleDemandeAffiliation = async () => {
    if (!currentUser?.user.id) return;
    
    setLoading(true);
    try {
      await affiliationApi.demanderAffiliation(currentUser.user.id, commentaire);
      showSuccess('🎉 Demande d\'affiliation envoyée avec succès ! Nos équipes vont l\'étudier dans les plus brefs délais.');
      setShowModal(false);
      setCommentaire('');
      loadStatutAffiliation(); // Recharger le statut
    } catch (error: any) {
      console.error('Erreur lors de la demande d\'affiliation:', error);
      showError('❌ Erreur lors de l\'envoi de la demande : ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = () => {
    if (!statutAffiliation) return null;

    switch (statutAffiliation.statut) {
      case 'NON_AFFILIE':
        return <span className="badge bg-secondary">Non affilié</span>;
      case 'DEMANDE_AFFILIATION':
        return <span className="badge bg-warning">Demande en cours</span>;
      case 'AFFILIE':
        return <span className="badge bg-success">Livreur affilié</span>;
      case 'AFFILIATION_REFUSEE':
        return <span className="badge bg-danger">Demande refusée</span>;
      default:
        return null;
    }
  };

  const getContenuCarte = () => {
    if (!statutAffiliation) {
      return (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2 mb-0 text-muted">Chargement du statut...</p>
        </div>
      );
    }

    switch (statutAffiliation.statut) {
      case 'NON_AFFILIE':
        return (
          <div>
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                <i className="bi bi-star me-2"></i>
                Devenez livreur affilié EcoDeli !
              </h6>
              <p className="text-muted mb-3">
                Accédez à des avantages exclusifs et à des missions prioritaires de nos commerçants partenaires.
              </p>
              
              <div className="row text-center mb-4">
                <div className="col-6 col-lg-3 mb-3">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-shield-check text-success" style={{fontSize: '1.5rem'}}></i>
                    <div className="mt-2">
                      <small className="fw-bold d-block">Assurance</small>
                      <small className="text-muted">renforcée</small>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-lg-3 mb-3">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-currency-euro text-primary" style={{fontSize: '1.5rem'}}></i>
                    <div className="mt-2">
                      <small className="fw-bold d-block">Tarifs</small>
                      <small className="text-muted">préférentiels</small>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-lg-3 mb-3">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-shop text-warning" style={{fontSize: '1.5rem'}}></i>
                    <div className="mt-2">
                      <small className="fw-bold d-block">Missions</small>
                      <small className="text-muted">commerçants</small>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-lg-3 mb-3">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-headset text-info" style={{fontSize: '1.5rem'}}></i>
                    <div className="mt-2">
                      <small className="fw-bold d-block">Support</small>
                      <small className="text-muted">dédié</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="w-100"
            >
              <i className="bi bi-person-check me-2"></i>
              Devenir livreur affilié
            </Button>
          </div>
        );

      case 'DEMANDE_AFFILIATION':
        return (
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <i className="bi bi-clock me-3" style={{fontSize: '1.5rem'}}></i>
            <div className="flex-grow-1">
              <strong>Demande d'affiliation en cours d'étude</strong>
              <p className="mb-0 mt-2 small">
                Votre demande a été envoyée le {new Date(statutAffiliation.dateDemandeAffiliation!).toLocaleDateString('fr-FR')}. 
                Nos équipes l'examinent et vous contacteront bientôt.
              </p>
              {statutAffiliation.commentaire && (
                <p className="mb-0 mt-2 small">
                  <strong>Votre message :</strong> "{statutAffiliation.commentaire}"
                </p>
              )}
            </div>
          </div>
        );

      case 'AFFILIE':
        return (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <i className="bi bi-check-circle me-3" style={{fontSize: '1.5rem'}}></i>
            <div className="flex-grow-1">
              <strong>🎉 Félicitations ! Vous êtes livreur affilié EcoDeli</strong>
              <p className="mb-0 mt-2 small">
                Statut validé le {new Date(statutAffiliation.dateValidationAffiliation!).toLocaleDateString('fr-FR')}. 
                Vous avez maintenant accès aux missions exclusives de nos commerçants partenaires.
              </p>
              <div className="mt-3">
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => window.location.href = '/annonces'}
                >
                  <i className="bi bi-shop me-2"></i>
                  Voir les missions commerçants
                </Button>
              </div>
            </div>
          </div>
        );

      case 'AFFILIATION_REFUSEE':
        return (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-x-circle me-3" style={{fontSize: '1.5rem'}}></i>
            <div className="flex-grow-1">
              <strong>Demande d'affiliation refusée</strong>
              <p className="mb-0 mt-2 small">
                Décision prise le {new Date(statutAffiliation.dateValidationAffiliation!).toLocaleDateString('fr-FR')}.
              </p>
              {statutAffiliation.commentaire && (
                <p className="mb-0 mt-2 small">
                  <strong>Motif :</strong> {statutAffiliation.commentaire}
                </p>
              )}
              <div className="mt-3">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowModal(true)}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Faire une nouvelle demande
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-award me-2 text-primary"></i>
            Affiliation EcoDeli
          </h6>
          {getStatutBadge()}
        </div>
        <div className="card-body">
          {getContenuCarte()}
        </div>
      </Card>

      {/* Modal de demande d'affiliation */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Demande d'affiliation EcoDeli"
        size="md"
      >
        <div className="modal-body">
          <div className="mb-4">
            <h6 className="text-primary">Conditions pour devenir livreur affilié :</h6>
            <ul className="list-unstyled mt-3">
              <li className="mb-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                Avoir effectué au moins 5 livraisons avec succès
              </li>
              <li className="mb-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                Maintenir une note moyenne ≥ 4/5
              </li>
              <li className="mb-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                Documents d'identité et permis vérifiés
              </li>
              <li className="mb-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                Engagement de qualité et ponctualité
              </li>
            </ul>
          </div>

          <div className="mb-3">
            <label htmlFor="commentaire" className="form-label">
              Message pour l'équipe EcoDeli <span className="text-muted">(optionnel)</span>
            </label>
            <textarea
              id="commentaire"
              className="form-control"
              rows={3}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Expliquez pourquoi vous souhaitez devenir livreur affilié..."
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDemandeAffiliation}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Envoi en cours...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                Envoyer la demande
              </>
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AffiliationCard;
