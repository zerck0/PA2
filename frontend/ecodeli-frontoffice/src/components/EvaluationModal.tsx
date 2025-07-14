import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { evaluationApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { TypeService } from '../types';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evalueId: number; // ID du prestataire ou livreur évalué
  serviceType: TypeService; // 'PRESTATION' ou 'LIVRAISON'
  serviceId: number; // ID de la prestation ou livraison
  evaluateurId: number; // ID du client qui évalue
  evalueNom?: string; // Nom de la personne évaluée (pour affichage)
  serviceTitre?: string; // Titre du service (pour affichage)
  onEvaluationSubmitted?: () => void; // Callback après soumission
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  evalueId,
  serviceType,
  serviceId,
  evaluateurId,
  evalueNom = 'la personne',
  serviceTitre = 'le service',
  onEvaluationSubmitted
}) => {
  const [note, setNote] = useState<number>(5);
  const [commentaire, setCommentaire] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (note < 1 || note > 5) {
      showError('La note doit être comprise entre 1 et 5 étoiles');
      return;
    }

    setIsSubmitting(true);

    try {
      await evaluationApi.create({
        evaluateurId,
        evalueId,
        serviceType,
        serviceId,
        note,
        commentaire: commentaire.trim() || undefined
      });

      showSuccess('Évaluation soumise avec succès !');
      onEvaluationSubmitted?.();
      handleClose();
      
    } catch (error: any) {
      console.error('Erreur lors de la soumission de l\'évaluation:', error);
      showError(
        error.response?.data?.error || 'Erreur lors de la soumission de l\'évaluation'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNote(5);
    setCommentaire('');
    setIsSubmitting(false);
    onClose();
  };

  const renderStars = () => {
    return (
      <div className="d-flex align-items-center gap-2 mb-3">
        <label className="form-label mb-0 me-2">Note :</label>
        <div className="d-flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`btn btn-sm p-1 ${
                star <= note ? 'text-warning' : 'text-muted'
              }`}
              onClick={() => setNote(star)}
              style={{ 
                border: 'none', 
                background: 'none',
                fontSize: '1.5rem',
                lineHeight: 1
              }}
            >
              ★
            </button>
          ))}
        </div>
        <span className="text-muted ms-2">
          {note} étoile{note > 1 ? 's' : ''}
        </span>
      </div>
    );
  };

  const getServiceTypeLabel = () => {
    return serviceType === 'PRESTATION' ? 'prestation' : 'livraison';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Évaluer ${evalueNom}`}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Vous êtes sur le point d'évaluer <strong>{evalueNom}</strong> pour la {getServiceTypeLabel()} : <strong>{serviceTitre}</strong>
          </div>
        </div>

        {/* Sélection des étoiles */}
        <div className="mb-4">
          {renderStars()}
          <small className="text-muted">
            Cliquez sur les étoiles pour noter de 1 à 5
          </small>
        </div>

        {/* Commentaire optionnel */}
        <div className="mb-4">
          <label htmlFor="commentaire" className="form-label">
            Commentaire <span className="text-muted">(optionnel)</span>
          </label>
          <textarea
            id="commentaire"
            className="form-control"
            rows={4}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder={`Partagez votre expérience avec ${evalueNom}...`}
            maxLength={1000}
          />
          <div className="form-text">
            {commentaire.length}/1000 caractères
          </div>
        </div>

        {/* Aperçu de l'évaluation */}
        <div className="mb-4 p-3 bg-light rounded">
          <h6 className="mb-2">Aperçu de votre évaluation :</h6>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="text-warning">
              {'★'.repeat(note)}{'☆'.repeat(5 - note)}
            </span>
            <span className="text-muted">({note}/5)</span>
          </div>
          {commentaire.trim() && (
            <p className="mb-0 text-muted small">
              "{commentaire.trim()}"
            </p>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="d-flex gap-2 justify-content-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi...' : 'Soumettre l\'évaluation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EvaluationModal;
