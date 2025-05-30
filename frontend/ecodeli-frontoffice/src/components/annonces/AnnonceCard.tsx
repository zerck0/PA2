import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';

/**
 * Props du composant AnnonceCard simplifié
 */
interface AnnonceCardProps {
  annonce: any; // On utilise any pour éviter les problèmes de mapping pour l'instant
  showActions?: boolean;
  onAction?: (action: string, annonce: any) => void;
}

/**
 * Composant AnnonceCard simplifié pour afficher les données de base
 * Correspond exactement à la structure backend
 */
const AnnonceCard: React.FC<AnnonceCardProps> = ({ 
  annonce, 
  showActions = true, 
  onAction 
}) => {

  /**
   * Retourne le badge de type d'annonce
   */
  const getTypeBadge = () => {
    const typeLabels: { [key: string]: { label: string; color: string } } = {
      'LIVRAISON_COLIS': { label: 'Livraison', color: 'primary' },
      'SERVICE_PERSONNE': { label: 'Service', color: 'success' },
      'TRANSPORT_PERSONNE': { label: 'Transport', color: 'info' },
      'COURSES': { label: 'Courses', color: 'warning' },
      'ACHAT_ETRANGER': { label: 'Achat étranger', color: 'secondary' }
    };
    
    const typeConfig = typeLabels[annonce.type] || { label: annonce.type || 'Service', color: 'secondary' };
    return <Badge bg={typeConfig.color}>{typeConfig.label}</Badge>;
  };

  /**
   * Gestion des actions sur l'annonce
   */
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action, annonce);
    }
  };

  return (
    <Card className="h-100 shadow-sm hover-card">
      <Card.Body className="d-flex flex-column">
        {/* Badge type d'annonce en haut */}
        <div className="mb-3">
          {getTypeBadge()}
        </div>

        {/* Titre */}
        <Card.Title className="h6 mb-3">
          {annonce.titre || 'Titre non disponible'}
        </Card.Title>
        
        {/* Lieux de départ et d'arrivée */}
        <div className="mb-3">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-geo-alt text-success me-1"></i>
            <strong>De :</strong> {annonce.villeDepart || annonce.adresseDepart || 'Non spécifié'}
          </small>
          <small className="text-muted d-block">
            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
            <strong>Vers :</strong> {annonce.villeArrivee || annonce.adresseArrivee || 'Non spécifié'}
          </small>
        </div>
        
        {/* Nom du créateur */}
        <div className="mb-3">
          <small className="text-muted">
            <i className="bi bi-person me-1"></i>
            Par {annonce.auteur?.prenom || ''} {annonce.auteur?.nom || 'Utilisateur'}
          </small>
        </div>
        
        {/* Prix et action */}
        <div className="mt-auto">
          <div className="d-flex justify-content-center mb-3">
            <span className="fs-5 fw-bold text-primary">
              {annonce.prixPropose ? Number(annonce.prixPropose).toFixed(2) : '0.00'} €
            </span>
          </div>

          {/* Bouton d'action */}
          {showActions && (
            <Button 
              variant="primary" 
              size="sm"
              className="w-100"
              onClick={() => handleAction('view')}
            >
              <i className="bi bi-eye me-1"></i>
              Voir détails
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AnnonceCard;
