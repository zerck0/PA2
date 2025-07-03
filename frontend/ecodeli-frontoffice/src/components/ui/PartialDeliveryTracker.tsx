import React from 'react';

interface SegmentInfo {
  existe: boolean;
  livreurId?: number;
  livreurNom?: string;
  entrepotId?: number;
  entrepotNom?: string;
  statut?: string;
}

interface PartialDeliveryTrackerProps {
  annonceId: number;
  adresseDepart: string;
  adresseArrivee: string;
  segments?: {
    depot: SegmentInfo;
    retrait: SegmentInfo;
    tousSegmentsAssignes: boolean;
  };
  onPrendreSegment?: (type: 'PARTIELLE_DEPOT' | 'PARTIELLE_RETRAIT', entrepotId: number) => void;
  currentUserId?: number;
  entrepots?: Array<{ id: number; nom: string; ville: string }>;
}

const PartialDeliveryTracker: React.FC<PartialDeliveryTrackerProps> = ({
  annonceId,
  adresseDepart,
  adresseArrivee,
  segments,
  onPrendreSegment,
  currentUserId,
  entrepots = []
}) => {
  // Déterminer l'entrepôt utilisé
  const entrepotUtilise = segments?.depot.entrepotNom || segments?.retrait.entrepotNom || 'Entrepôt à définir';

  // Fonction pour obtenir l'icône et la couleur selon l'état du segment
  const getSegmentStatus = (segment: SegmentInfo, isDepot: boolean) => {
    if (!segment.existe) {
      return {
        icon: '❓',
        color: 'text-muted',
        bgColor: 'bg-light',
        label: 'Disponible',
        canTake: true
      };
    }

    if (segment.livreurId) {
      const isCurrentUser = segment.livreurId === currentUserId;
      return {
        icon: '✅',
        color: isCurrentUser ? 'text-success' : 'text-primary',
        bgColor: isCurrentUser ? 'bg-success-subtle' : 'bg-primary-subtle',
        label: isCurrentUser ? 'Vous' : segment.livreurNom,
        canTake: false
      };
    }

    return {
      icon: '⏳',
      color: 'text-warning',
      bgColor: 'bg-warning-subtle',
      label: 'En attente',
      canTake: false
    };
  };

  const depotStatus = getSegmentStatus(segments?.depot || { existe: false }, true);
  const retraitStatus = getSegmentStatus(segments?.retrait || { existe: false }, false);

  const handlePrendreSegment = (type: 'PARTIELLE_DEPOT' | 'PARTIELLE_RETRAIT') => {
    if (!onPrendreSegment || entrepots.length === 0) return;
    
    // Pour simplifier, on prend le premier entrepôt disponible
    // Dans une vraie application, on afficherait un modal de sélection
    const premierEntrepot = entrepots[0];
    if (premierEntrepot) {
      onPrendreSegment(type, premierEntrepot.id);
    }
  };

  return (
    <div className="partial-delivery-tracker p-3 border rounded">
      <h6 className="mb-3">
        <i className="bi bi-truck me-2"></i>
        Livraison partielle - Suivi des segments
      </h6>
      
      {/* Tracker visuel à 3 points */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        
        {/* Point 1: Départ */}
        <div className="text-center" style={{ flex: '0 0 25%' }}>
          <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${depotStatus.bgColor}`} 
               style={{ width: '40px', height: '40px', margin: '0 auto' }}>
            <span style={{ fontSize: '1.2rem' }}>{depotStatus.icon}</span>
          </div>
          <div>
            <strong>🏠 Départ</strong>
            <div className="small text-muted">{adresseDepart}</div>
            <div className={`small ${depotStatus.color}`}>
              <strong>{depotStatus.label}</strong>
            </div>
            {depotStatus.canTake && (
              <button 
                className="btn btn-sm btn-outline-primary mt-1"
                onClick={() => handlePrendreSegment('PARTIELLE_DEPOT')}
              >
                Prendre dépôt
              </button>
            )}
          </div>
        </div>

        {/* Flèche 1 */}
        <div className="text-center" style={{ flex: '0 0 20%' }}>
          <i className="bi bi-arrow-right text-muted" style={{ fontSize: '1.5rem' }}></i>
        </div>

        {/* Point 2: Entrepôt */}
        <div className="text-center" style={{ flex: '0 0 25%' }}>
          <div className="rounded-circle d-flex align-items-center justify-content-center mb-2 bg-info-subtle" 
               style={{ width: '40px', height: '40px', margin: '0 auto' }}>
            <i className="bi bi-building text-info"></i>
          </div>
          <div>
            <strong>🏢 Entrepôt</strong>
            <div className="small text-muted">{entrepotUtilise}</div>
            <div className="small text-info">
              <strong>Point de transit</strong>
            </div>
          </div>
        </div>

        {/* Flèche 2 */}
        <div className="text-center" style={{ flex: '0 0 20%' }}>
          <i className="bi bi-arrow-right text-muted" style={{ fontSize: '1.5rem' }}></i>
        </div>

        {/* Point 3: Arrivée */}
        <div className="text-center" style={{ flex: '0 0 25%' }}>
          <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${retraitStatus.bgColor}`} 
               style={{ width: '40px', height: '40px', margin: '0 auto' }}>
            <span style={{ fontSize: '1.2rem' }}>{retraitStatus.icon}</span>
          </div>
          <div>
            <strong>🎯 Arrivée</strong>
            <div className="small text-muted">{adresseArrivee}</div>
            <div className={`small ${retraitStatus.color}`}>
              <strong>{retraitStatus.label}</strong>
            </div>
            {retraitStatus.canTake && (
              <button 
                className="btn btn-sm btn-outline-success mt-1"
                onClick={() => handlePrendreSegment('PARTIELLE_RETRAIT')}
              >
                Prendre retrait
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Informations sur l'état */}
      <div className="border-top pt-2">
        {segments?.tousSegmentsAssignes ? (
          <div className="alert alert-success py-2 mb-0">
            <i className="bi bi-check-circle me-2"></i>
            <strong>Tous les segments sont assignés !</strong> Les livreurs peuvent commencer leurs livraisons.
          </div>
        ) : (
          <div className="alert alert-info py-2 mb-0">
            <i className="bi bi-info-circle me-2"></i>
            <strong>En attente :</strong> {!segments?.depot.existe && 'Segment dépôt disponible. '} 
            {!segments?.retrait.existe && 'Segment retrait disponible.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartialDeliveryTracker;
