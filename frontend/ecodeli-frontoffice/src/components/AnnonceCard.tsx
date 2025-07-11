import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import { Annonce } from '../types';

interface AnnonceCardProps {
  annonce: Annonce;
  onEdit?: (annonceId: number) => void;
  onContact?: (annonceId: number) => void;
  showActions?: boolean;
  extraInfo?: React.ReactNode;
}

const AnnonceCard: React.FC<AnnonceCardProps> = ({ 
  annonce, 
  onEdit, 
  onContact, 
  showActions = true,
  extraInfo
}) => {
  const navigate = useNavigate();

  // Naviguer vers les détails de l'annonce
  const handleVoirDetails = () => {
    navigate(`/annonces/${annonce.id}`);
  };

  // Détecter si l'annonce a un segment dépôt assigné
  const detecterSegmentDepotAssigne = () => {
    if (annonce.description && annonce.description.includes('##SEGMENT_DEPOT_ASSIGNE##')) {
      const parts = annonce.description.split('##SEGMENT_DEPOT_ASSIGNE##');
      const infosParts = parts[1]?.split('##');
      return {
        aSegmentDepotAssigne: true,
        descriptionOriginale: parts[0],
        entrepotNom: infosParts[0] || '',
        livreurNom: infosParts[1] || ''
      };
    }
    return {
      aSegmentDepotAssigne: false,
      descriptionOriginale: annonce.description,
      entrepotNom: '',
      livreurNom: ''
    };
  };

  const segmentInfo = detecterSegmentDepotAssigne();

  // Troncature de la description
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Badge pour le type d'annonce
  const getTypeBadge = (type: string) => {
    const badges = {
      'LIVRAISON_COLIS': { color: 'primary', label: 'Colis' },
      'COURSES': { color: 'success', label: 'Courses' },
      'TRANSPORT_PERSONNE': { color: 'info', label: 'Transport' },
      'SERVICE_PERSONNE': { color: 'warning', label: 'Service' },
      'ACHAT_ETRANGER': { color: 'secondary', label: 'Achat' }
    };
    const badge = badges[type as keyof typeof badges] || { color: 'secondary', label: type };
    return <span className={`badge bg-${badge.color} me-2`}>{badge.label}</span>;
  };

  // Construire l'URL complète de l'image
  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    
    // Si l'URL est déjà complète, la retourner
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    
    // Si c'est une URL relative, construire l'URL complète
    // En développement, utiliser le proxy Vite qui redirige vers le backend
    if (photoUrl.startsWith('/api')) {
      // URL déjà correcte pour le proxy Vite
      return photoUrl;
    }
    
    // Sinon, construire l'URL complète
    const baseUrl = import.meta.env.PROD 
      ? (import.meta.env.VITE_API_URL || 'http://localhost:8080')
      : ''; // En dev, pas de baseURL car on utilise le proxy
      
    return baseUrl + photoUrl;
  };

  return (
    <Card className="h-100">
      <div className="row g-0 h-100">
        {/* Image */}
        <div className="col-md-4">
          <div 
            className="d-flex align-items-center justify-content-center bg-light rounded-start position-relative"
            style={{ 
              width: '100%',
              height: '180px',
              overflow: 'hidden'
            }}
          >
            {getImageUrl(annonce.photoUrl) ? (
              <img 
                src={getImageUrl(annonce.photoUrl)!} 
                alt={annonce.titre}
                className="rounded-start"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  console.error('Erreur chargement image:', getImageUrl(annonce.photoUrl));
                  // Masquer l'image cassée et afficher le placeholder
                  (e.target as HTMLImageElement).style.display = 'none';
                  const container = (e.target as HTMLImageElement).parentElement;
                  if (container) {
                    container.innerHTML = '<i class="bi bi-image text-muted" style="font-size: 2rem;"></i>';
                  }
                }}
              />
            ) : (
              <i className="bi bi-image text-muted" style={{ fontSize: '2rem' }}></i>
            )}
          </div>
        </div>
        
        {/* Contenu */}
        <div className="col-md-8">
          <div className="card-body h-100 d-flex flex-column">
            {/* Header avec badges */}
            <div className="d-flex align-items-center mb-2">
              {getTypeBadge(annonce.type)}
              <span className="badge bg-light text-dark">{annonce.statut}</span>
              {segmentInfo.aSegmentDepotAssigne && (
                <span className="badge bg-warning text-dark ms-2">
                  <i className="bi bi-truck me-1"></i>
                  En transit
                </span>
              )}
            </div>
            
            {/* Titre */}
            <h5 className="card-title mb-2">{annonce.titre}</h5>
            
            {/* Alerte pour segment dépôt assigné */}
            {segmentInfo.aSegmentDepotAssigne && (
              <div className="alert alert-info py-2 mb-2">
                <i className="bi bi-info-circle me-2"></i>
                <small>
                  <strong>Segment dépôt assigné</strong> - Colis en cours de dépôt par {segmentInfo.livreurNom} vers {segmentInfo.entrepotNom}
                </small>
              </div>
            )}
            
            {/* Description */}
            <p className="card-text text-muted mb-3">
              {truncateText(segmentInfo.descriptionOriginale)}
            </p>
            
            {/* Localisation */}
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-geo-alt me-2 text-primary"></i>
              <small className="text-muted">
                <strong>{annonce.villeDepart}</strong> → <strong>{annonce.villeArrivee}</strong>
              </small>
            </div>
            
            {/* Prix et date */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                {annonce.prixPropose && (
                  <span className="h6 text-success mb-0">
                    <i className="bi bi-currency-euro me-1"></i>
                    {annonce.prixPropose}€
                  </span>
                )}
              </div>
              <small className="text-muted">
                {new Date(annonce.dateCreation).toLocaleDateString()}
              </small>
            </div>
            
            {/* Actions */}
            {showActions && (
              <div className="mt-auto">
                <div className="d-flex gap-2 flex-wrap">
                  {/* Bouton Voir détails - toujours disponible */}
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleVoirDetails}
                  >
                    <i className="bi bi-eye me-1"></i>
                    Voir détails
                  </Button>

                  {/* Boutons existants */}
                  {onEdit && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => onEdit(annonce.id)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Modifier
                    </Button>
                  )}
                  {onContact && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => onContact(annonce.id)}
                    >
                      <i className="bi bi-chat-dots me-1"></i>
                      Contacter
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Informations supplémentaires (pour les livraisons) */}
            {extraInfo && extraInfo}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnnonceCard;
