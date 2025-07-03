import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Livraison } from '../types';

interface LivraisonCardProps {
  livraison: Livraison;
  onConsulter: (livraison: Livraison) => void;
  onCommencer?: (livraison: Livraison) => void;
  peutCommencer?: boolean;
  messageAttente?: string;
}

const LivraisonCard: React.FC<LivraisonCardProps> = ({ 
  livraison, 
  onConsulter, 
  onCommencer,
  peutCommencer = false,
  messageAttente
}) => {
  // Construire l'URL complète de l'image
  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    
    if (photoUrl.startsWith('/api')) {
      return photoUrl;
    }
    
    const baseUrl = import.meta.env.PROD 
      ? (import.meta.env.VITE_API_URL || 'http://localhost:8080')
      : '';
      
    return baseUrl + photoUrl;
  };

  // Obtenir les bonnes adresses selon le type de livraison
  const getAdressesAffichage = () => {
    const annonce = livraison.annonce;
    
    switch (livraison.typeLivraison) {
      case 'COMPLETE':
        return {
          depart: {
            label: annonce.villeDepart,
            adresse: annonce.adresseDepart,
            icon: 'bi-geo-alt'
          },
          arrivee: {
            label: annonce.villeArrivee,
            adresse: annonce.adresseArrivee,
            icon: 'bi-geo-alt-fill'
          }
        };
        
      case 'PARTIELLE_DEPOT':
        return {
          depart: {
            label: annonce.villeDepart,
            adresse: annonce.adresseDepart,
            icon: 'bi-geo-alt'
          },
          arrivee: {
            label: livraison.entrepot?.ville || 'Entrepôt',
            adresse: livraison.entrepot?.nom || 'Entrepôt de stockage',
            icon: 'bi-building'
          }
        };
        
      case 'PARTIELLE_RETRAIT':
        return {
          depart: {
            label: livraison.entrepot?.ville || 'Entrepôt',
            adresse: livraison.entrepot?.nom || 'Entrepôt de stockage',
            icon: 'bi-building'
          },
          arrivee: {
            label: annonce.villeArrivee,
            adresse: annonce.adresseArrivee,
            icon: 'bi-geo-alt-fill'
          }
        };
        
      default:
        return {
          depart: {
            label: livraison.adresseDepart,
            adresse: livraison.adresseDepart,
            icon: 'bi-geo-alt'
          },
          arrivee: {
            label: livraison.adresseArrivee,
            adresse: livraison.adresseArrivee,
            icon: 'bi-geo-alt-fill'
          }
        };
    }
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

  // Badge pour le statut de livraison
  const getStatutLivraisonBadge = (statut: string) => {
    const badges = {
      'ASSIGNEE': { color: 'info', label: 'Assignée' },
      'EN_COURS': { color: 'warning', label: 'En cours' },
      'LIVREE': { color: 'success', label: 'Livrée' },
      'STOCKEE': { color: 'primary', label: 'Stockée' },
      'ANNULEE': { color: 'danger', label: 'Annulée' }
    };
    const badge = badges[statut as keyof typeof badges] || { color: 'secondary', label: statut };
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>;
  };

  // Badge pour le type de livraison avec numéro de segment
  const getTypeLivraisonBadge = (type: string) => {
    const badges = {
      'COMPLETE': { color: 'success', label: 'Complète', segment: null },
      'PARTIELLE_DEPOT': { color: 'warning', label: 'Segment 1/2 - Dépôt', segment: '1/2' },
      'PARTIELLE_RETRAIT': { color: 'info', label: 'Segment 2/2 - Retrait', segment: '2/2' }
    };
    const badge = badges[type as keyof typeof badges] || { color: 'secondary', label: type, segment: null };
    return (
      <span className={`badge bg-${badge.color} me-2 d-flex align-items-center`}>
        {badge.segment && (
          <span className="me-1 fw-bold">{badge.segment}</span>
        )}
        {badge.label}
      </span>
    );
  };

  // Troncature de la description
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const adresses = getAdressesAffichage();

  return (
    <Card className="h-100">
      <div className="row g-0 h-100">
        {/* Image */}
        <div className="col-md-4">
          <div 
            className="d-flex align-items-center justify-content-center bg-light rounded-start position-relative"
            style={{ 
              width: '100%',
              height: '200px',
              overflow: 'hidden'
            }}
          >
            {getImageUrl(livraison.annonce.photoUrl) ? (
              <img 
                src={getImageUrl(livraison.annonce.photoUrl)!} 
                alt={livraison.annonce.titre}
                className="rounded-start"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  console.error('Erreur chargement image:', getImageUrl(livraison.annonce.photoUrl));
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
            <div className="d-flex flex-wrap align-items-center mb-2 gap-1">
              {getTypeBadge(livraison.annonce.type)}
              {getTypeLivraisonBadge(livraison.typeLivraison)}
              {getStatutLivraisonBadge(livraison.statut)}
            </div>
            
            {/* Titre */}
            <h5 className="card-title mb-2">{livraison.annonce.titre}</h5>
            
            {/* Description */}
            <p className="card-text text-muted mb-3">
              {truncateText(livraison.annonce.description)}
            </p>
            
            {/* Itinéraire spécialisé selon le type de livraison */}
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <i className={`${adresses.depart.icon} me-2 text-primary`}></i>
                <div className="flex-grow-1">
                  <small className="text-muted d-block">Point de départ</small>
                  <strong>{adresses.depart.label}</strong>
                  {adresses.depart.adresse !== adresses.depart.label && (
                    <div><small className="text-muted">{adresses.depart.adresse}</small></div>
                  )}
                </div>
              </div>
              
              <div className="d-flex align-items-center justify-content-center my-1">
                <i className="bi bi-arrow-down text-primary"></i>
              </div>
              
              <div className="d-flex align-items-center">
                <i className={`${adresses.arrivee.icon} me-2 text-success`}></i>
                <div className="flex-grow-1">
                  <small className="text-muted d-block">Point d'arrivée</small>
                  <strong>{adresses.arrivee.label}</strong>
                  {adresses.arrivee.adresse !== adresses.arrivee.label && (
                    <div><small className="text-muted">{adresses.arrivee.adresse}</small></div>
                  )}
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mb-3">
              {/* Code de validation */}
              <div className="mb-2">
                <small className="text-muted d-block">Code de validation</small>
                <code className="bg-light p-1 rounded">{livraison.codeValidation}</code>
              </div>

              {/* Prix et date */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {livraison.annonce.prixPropose && (
                    <span className="h6 text-success mb-0">
                      <i className="bi bi-currency-euro me-1"></i>
                      {livraison.annonce.prixPropose}€
                    </span>
                  )}
                </div>
                <small className="text-muted">
                  {new Date(livraison.annonce.dateCreation).toLocaleDateString()}
                </small>
              </div>
            </div>

            {/* Message d'attente pour livraisons partielles */}
            {messageAttente && (
              <div className="alert alert-info py-2 mb-3">
                <i className="bi bi-info-circle me-2"></i>
                <small>{messageAttente}</small>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-auto">
              <div className="d-flex gap-2 flex-wrap">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => onConsulter(livraison)}
                >
                  <i className="bi bi-eye me-1"></i>
                  Consulter
                </Button>
                
                {livraison.statut === 'ASSIGNEE' && onCommencer && (
                  <span 
                    title={!peutCommencer 
                      ? "En attente que le segment précédent soit terminé" 
                      : "Commencer la livraison"}
                  >
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => onCommencer(livraison)}
                      disabled={!peutCommencer}
                    >
                      <i className="bi bi-play-circle me-1"></i>
                      Commencer
                    </Button>
                  </span>
                )}
                
                {livraison.statut === 'EN_COURS' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => onConsulter(livraison)}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Terminer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LivraisonCard;
