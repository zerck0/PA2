import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import { Livraison } from '../types';
import { livraisonApi } from '../services/api';
import { useToast } from '../hooks/useToast';

interface LivraisonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  livraison: Livraison | null;
  onLivraisonUpdated: () => void;
}

const LivraisonDetailModal: React.FC<LivraisonDetailModalProps> = ({
  isOpen,
  onClose,
  livraison,
  onLivraisonUpdated
}) => {
  const [codeValidation, setCodeValidation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError, showInfo } = useToast();

  if (!livraison) return null;

  // Fonction pour obtenir le badge du statut
  const getStatutBadge = (statut: string) => {
    const badges = {
      'EN_COURS': { color: 'warning', label: 'En cours' },
      'LIVREE': { color: 'success', label: 'Livrée' },
      'STOCKEE': { color: 'primary', label: 'Stockée' },
      'ANNULEE': { color: 'danger', label: 'Annulée' }
    };
    const badge = badges[statut as keyof typeof badges] || { color: 'secondary', label: statut };
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>;
  };

  // Fonction pour obtenir le badge du type
  const getTypeBadge = (type: string) => {
    const badges = {
      'COMPLETE': { color: 'success', label: 'Complète' },
      'PARTIELLE_DEPOT': { color: 'warning', label: 'Partielle - Dépôt' },
      'PARTIELLE_RETRAIT': { color: 'info', label: 'Partielle - Retrait' }
    };
    const badge = badges[type as keyof typeof badges] || { color: 'secondary', label: type };
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>;
  };


  // Terminer la livraison
  const handleTerminer = async () => {
    if (!codeValidation.trim()) {
      setError('Veuillez saisir le code de validation');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await livraisonApi.terminerLivraison(livraison.id, codeValidation.trim());
      showSuccess('Livraison terminée avec succès');
      onLivraisonUpdated();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la finalisation de la livraison';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Annuler la livraison
  const handleAnnuler = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette livraison ?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await livraisonApi.annulerLivraison(livraison.id);
      showInfo('Livraison annulée');
      onLivraisonUpdated();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'annulation de la livraison';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser le formulaire à la fermeture
  const handleClose = () => {
    setCodeValidation('');
    setError('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Détails de la livraison"
      size="lg"
    >
      <div className="row g-4">
        {/* Informations de l'annonce */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-megaphone me-2"></i>
                Annonce
              </h6>
            </div>
            <div className="card-body">
              {(() => {
                // Déterminer la source : annonce client ou annonce commerçant
                const source = livraison.annonce || livraison.annonceCommercant;
                
                if (!source) {
                  return <p className="text-muted">Aucune information sur l'annonce</p>;
                }
                
                return (
                  <>
                    <h6>{source.titre}</h6>
                    <p className="text-muted small mb-2">{source.description}</p>
                    
                    <div className="mb-2">
                      {livraison.annonce ? (
                        // Annonce client
                        <><strong>Client :</strong> {(source as any).auteur.prenom} {(source as any).auteur.nom}</>
                      ) : (
                        // Annonce commerçant
                        <><strong>Commerçant :</strong> {(source as any).commercant.prenom} {(source as any).commercant.nom}</>
                      )}
                    </div>
                    
                    {source.prixPropose && (
                      <div className="mb-2">
                        <strong>Prix proposé :</strong> 
                        <span className="text-success ms-1">{source.prixPropose}€</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Informations de livraison */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-truck me-2"></i>
                Livraison
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex gap-2 mb-3">
                {getTypeBadge(livraison.typeLivraison)}
                {getStatutBadge(livraison.statut)}
              </div>

              <div className="mb-2">
                <strong>De :</strong> {livraison.adresseDepart}
              </div>
              <div className="mb-3">
                <strong>Vers :</strong> {livraison.adresseArrivee}
              </div>

              {livraison.entrepot && (
                <div className="mb-3">
                  <strong>Entrepôt :</strong>
                  <div className="text-muted small">
                    {livraison.entrepot.nom} - {livraison.entrepot.ville}
                  </div>
                </div>
              )}

              <div className="mb-2">
                <strong>Code de validation :</strong>
                <div>
                  <code className="bg-light p-2 rounded d-inline-block">
                    {livraison.codeValidation}
                  </code>
                </div>
              </div>

              {livraison.dateDebut && (
                <div className="mb-2">
                  <strong>Débutée le :</strong> {new Date(livraison.dateDebut).toLocaleString()}
                </div>
              )}

              {livraison.dateFin && (
                <div className="mb-2">
                  <strong>Terminée le :</strong> {new Date(livraison.dateFin).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mt-3">
          <Alert type="danger">{error}</Alert>
        </div>
      )}

      {/* Actions selon le statut */}
      {livraison.statut === 'EN_COURS' && (
        <div className="mt-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>
                Terminer la livraison
              </h6>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Demandez le code de validation au client et saisissez-le ci-dessous pour confirmer la livraison.
              </p>
              
              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="Code de validation"
                    value={codeValidation}
                    onChange={setCodeValidation}
                    placeholder="Saisissez le code..."
                    disabled={isLoading}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <Button
                    variant="success"
                    onClick={handleTerminer}
                    disabled={isLoading || !codeValidation.trim()}
                    className="w-100"
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Confirmer la livraison
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action dans le footer */}
      <div className="modal-footer">
        <div className="d-flex gap-2 w-100">
          {livraison.statut === 'EN_COURS' && (
            <Button
              variant="danger"
              onClick={handleAnnuler}
              disabled={isLoading}
            >
              <i className="bi bi-x-circle me-2"></i>
              Annuler
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="ms-auto"
          >
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LivraisonDetailModal;
