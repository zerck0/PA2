import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { AnnonceCommercant } from '../types';

interface AnnonceCommercantCardProps {
  annonce: AnnonceCommercant;
  onPrendreEnCharge?: (annonceId: number) => void;
  showActions?: boolean;
}

const AnnonceCommercantCard: React.FC<AnnonceCommercantCardProps> = ({ 
  annonce, 
  onPrendreEnCharge,
  showActions = true
}) => {
  
  // Troncature de la description
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Badge pour le statut
  const getStatutBadge = (statut: string) => {
    const badges = {
      'ACTIVE': { color: 'success', label: 'Disponible' },
      'ASSIGNEE': { color: 'warning', label: 'Assignée' },
      'EN_COURS': { color: 'info', label: 'En cours' },
      'TERMINEE': { color: 'secondary', label: 'Terminée' },
      'ANNULEE': { color: 'danger', label: 'Annulée' }
    };
    const badge = badges[statut as keyof typeof badges] || { color: 'secondary', label: statut };
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>;
  };

  const peutPrendreEnCharge = annonce.statut === 'ACTIVE';

  return (
    <Card className="h-100 mb-3">
      <div className="card-body">
        {/* Header avec badges */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span className="badge bg-primary me-2">
              <i className="bi bi-shop me-1"></i>
              Mission Commerçant
            </span>
            {getStatutBadge(annonce.statut)}
            {annonce.reserveAuxAffilies && (
              <span className="badge bg-info ms-2">
                <i className="bi bi-award me-1"></i>
                Affiliés EcoDeli
              </span>
            )}
          </div>
          <small className="text-muted">
            {new Date(annonce.dateCreation).toLocaleDateString()}
          </small>
        </div>
        
        {/* Titre */}
        <h5 className="card-title mb-2">{annonce.titre}</h5>
        
        {/* Description */}
        <p className="card-text text-muted mb-3">
          {truncateText(annonce.description)}
        </p>
        
        {/* Liste des courses (aperçu) */}
        <div className="mb-3">
          <h6 className="small text-primary mb-2">
            <i className="bi bi-cart me-1"></i>
            Liste des courses :
          </h6>
          <p className="small bg-light p-2 rounded">
            {truncateText(annonce.listeCourses, 150)}
          </p>
        </div>
        
        {/* Informations pratiques */}
        <div className="row text-center mb-3">
          <div className="col-4">
            <div className="text-primary">
              <i className="bi bi-geo-alt"></i>
            </div>
            <small className="text-muted">
              <strong>{annonce.villeDepart}</strong> → <strong>{annonce.villeArrivee}</strong>
            </small>
          </div>
          <div className="col-4">
            <div className="text-success">
              <i className="bi bi-currency-euro"></i>
            </div>
            <small className="text-muted">
              <strong>{annonce.prixPropose}€</strong>
            </small>
          </div>
          <div className="col-4">
            <div className="text-info">
              <i className="bi bi-box"></i>
            </div>
            <small className="text-muted">
              {annonce.quantiteProduits || 0} articles
            </small>
          </div>
        </div>

        {/* Dates importantes */}
        {(annonce.dateLimite || annonce.datePreferee) && (
          <div className="mb-3">
            {annonce.dateLimite && (
              <div className="small text-warning mb-1">
                <i className="bi bi-clock me-1"></i>
                <strong>Date limite :</strong> {new Date(annonce.dateLimite).toLocaleDateString()}
              </div>
            )}
            {annonce.datePreferee && (
              <div className="small text-info">
                <i className="bi bi-calendar-heart me-1"></i>
                <strong>Date préférée :</strong> {new Date(annonce.datePreferee).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="d-flex gap-2 flex-wrap">
            {/* Bouton principal : Prendre en charge */}
            {onPrendreEnCharge && peutPrendreEnCharge && (
              <Button 
                variant="success" 
                size="sm"
                onClick={() => onPrendreEnCharge(annonce.id)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Prendre en charge
              </Button>
            )}
            
            {/* Bouton voir détails */}
            <Button 
              variant="outline-primary" 
              size="sm"
            >
              <i className="bi bi-eye me-1"></i>
              Voir détails
            </Button>
            
            {/* Bouton contacter le commerçant */}
            <Button 
              variant="outline-secondary" 
              size="sm"
            >
              <i className="bi bi-chat-dots me-1"></i>
              Contacter
            </Button>
          </div>
        )}
        
        {/* Message si déjà assignée */}
        {!peutPrendreEnCharge && annonce.statut === 'ASSIGNEE' && (
          <div className="alert alert-warning py-2 mt-2 mb-0">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              Cette mission est déjà assignée à un autre livreur.
            </small>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AnnonceCommercantCard;
