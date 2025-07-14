import React from 'react';

interface NoteMoyenneProps {
  note: number;
  nombreEvaluations: number;
  typeService?: 'PRESTATION' | 'LIVRAISON' | 'GLOBAL';
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const NoteMoyenne: React.FC<NoteMoyenneProps> = ({
  note,
  nombreEvaluations,
  typeService = 'GLOBAL',
  className = '',
  showDetails = true,
  size = 'md'
}) => {
  // Arrondir la note à 1 décimale
  const noteArrondie = Math.round(note * 10) / 10;
  
  // Calculer les étoiles pleines, demi-étoiles et étoiles vides
  const etoilesPleine = Math.floor(noteArrondie);
  const demiEtoile = noteArrondie % 1 >= 0.5;
  const etoilesVides = 5 - etoilesPleine - (demiEtoile ? 1 : 0);

  // Styles selon la taille
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          star: 'fs-6',
          text: 'small',
          badge: 'badge-sm'
        };
      case 'lg':
        return {
          star: 'fs-3',
          text: 'fs-5',
          badge: 'fs-6'
        };
      default: // md
        return {
          star: 'fs-5',
          text: '',
          badge: 'small'
        };
    }
  };

  const styles = getSizeStyles();

  // Couleur selon la note
  const getNoteColor = () => {
    if (noteArrondie >= 4.5) return 'text-success';
    if (noteArrondie >= 3.5) return 'text-warning';
    if (noteArrondie >= 2.5) return 'text-orange';
    return 'text-danger';
  };

  // Label du type de service
  const getTypeLabel = () => {
    switch (typeService) {
      case 'PRESTATION':
        return 'prestations';
      case 'LIVRAISON':
        return 'livraisons';
      default:
        return 'évaluations';
    }
  };

  // Affichage conditionnel si aucune évaluation
  if (nombreEvaluations === 0) {
    return (
      <div className={`d-flex align-items-center gap-2 ${className}`}>
        <span className={`text-muted ${styles.star}`}>
          ☆☆☆☆☆
        </span>
        {showDetails && (
          <span className={`text-muted ${styles.text}`}>
            Aucune évaluation
          </span>
        )}
      </div>
    );
  }

  const renderStars = () => {
    const stars = [];
    
    // Étoiles pleines
    for (let i = 0; i < etoilesPleine; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-warning">★</span>
      );
    }
    
    // Demi-étoile
    if (demiEtoile) {
      stars.push(
        <span key="half" className="text-warning position-relative">
          <span className="text-muted">☆</span>
          <span 
            className="position-absolute top-0 start-0 text-warning overflow-hidden" 
            style={{ width: '50%' }}
          >
            ★
          </span>
        </span>
      );
    }
    
    // Étoiles vides
    for (let i = 0; i < etoilesVides; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-muted">☆</span>
      );
    }
    
    return stars;
  };

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      {/* Étoiles */}
      <div className={`d-flex align-items-center ${styles.star}`}>
        {renderStars()}
      </div>
      
      {/* Note numérique et détails */}
      {showDetails && (
        <div className="d-flex align-items-center gap-2">
          <span className={`fw-bold ${getNoteColor()} ${styles.text}`}>
            {noteArrondie.toFixed(1)}
          </span>
          <span className={`text-muted ${styles.badge}`}>
            ({nombreEvaluations} {getTypeLabel()})
          </span>
        </div>
      )}
      
      {/* Badge de qualité */}
      {showDetails && noteArrondie >= 4.5 && (
        <span className="badge bg-success ms-1">
          <i className="bi bi-award me-1"></i>
          Excellent
        </span>
      )}
    </div>
  );
};

export default NoteMoyenne;
