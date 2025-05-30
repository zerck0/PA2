import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import { useAnnonces } from '../hooks/useAnnonces';
import { ANNONCE_STATUS } from '../constants/appConfig';
import { AnnonceCard } from '../components/annonces';

/**
 * Page des annonces disponibles pour les livreurs
 * Utilise le composant AnnonceCard unifié avec des actions spécifiques livreur
 */
const LivreurAnnonces: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const { annonces, isLoading, error, clearError } = useAnnonces();
  const [filtreStatut, setFiltreStatut] = useState('');

  // Filtrer les annonces selon le statut pour les livreurs
  const filteredAnnonces = annonces.filter(annonce => {
    // Filtrer par statut si sélectionné
    if (filtreStatut && annonce.status !== filtreStatut) {
      return false;
    }
    
    // Afficher seulement les annonces pertinentes pour les livreurs
    return annonce.status === ANNONCE_STATUS.ACTIVE || 
           annonce.status === ANNONCE_STATUS.EN_COURS || 
           annonce.status === ANNONCE_STATUS.TERMINEE;
  });

  /**
   * Gestion des actions spécifiques aux livreurs
   */
  const handleLivreurAction = (action: string, annonce: any) => {
    switch (action) {
      case 'view':
        console.log('Voir détails de l\'annonce:', annonce.id);
        // TODO: Implémenter la navigation vers la page de détail
        break;
      case 'accept':
        console.log('Accepter l\'annonce:', annonce.id);
        // TODO: Implémenter l'API pour accepter une annonce
        alert(`Fonctionnalité à implémenter : Accepter l'annonce #${annonce.id}`);
        break;
      case 'complete':
        console.log('Terminer la livraison:', annonce.id);
        // TODO: Implémenter l'API pour terminer une livraison
        alert(`Fonctionnalité à implémenter : Terminer la livraison #${annonce.id}`);
        break;
      case 'contact':
        console.log('Contacter le client:', annonce.id);
        // TODO: Implémenter la messagerie
        break;
      default:
        console.log('Action non reconnue:', action);
    }
  };

  /**
   * Composant AnnonceCard adapté pour les livreurs avec boutons contextuels
   */
  const LivreurAnnonceCard: React.FC<{ annonce: any }> = ({ annonce }) => {
    return (
      <div className="position-relative">
        <AnnonceCard
          annonce={annonce}
          showActions={false} // On gère les actions manuellement
          variant="default"
        />
        
        {/* Actions spécifiques livreur en overlay */}
        <div className="position-absolute bottom-0 end-0 start-0 p-3 bg-white border-top">
          <div className="d-grid gap-2">
            {annonce.status === ANNONCE_STATUS.ACTIVE && (
              <>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => handleLivreurAction('accept', annonce)}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Accepter cette mission
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => handleLivreurAction('contact', annonce)}
                >
                  <i className="bi bi-chat-dots me-1"></i>
                  Contacter le client
                </Button>
              </>
            )}
            
            {annonce.status === ANNONCE_STATUS.EN_COURS && (
              <>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleLivreurAction('complete', annonce)}
                >
                  <i className="bi bi-check-square me-1"></i>
                  Marquer comme terminé
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => handleLivreurAction('contact', annonce)}
                >
                  <i className="bi bi-chat-dots me-1"></i>
                  Contacter le client
                </Button>
              </>
            )}
            
            {annonce.status === ANNONCE_STATUS.TERMINEE && (
              <div className="text-center">
                <span className="text-success small">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  Mission terminée
                </span>
              </div>
            )}
            
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => handleLivreurAction('view', annonce)}
            >
              <i className="bi bi-eye me-1"></i>
              Voir tous les détails
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Vous devez être connecté en tant que livreur pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-primary mb-2">
            <i className="bi bi-truck me-2"></i>
            Annonces disponibles
          </h1>
          <p className="text-muted">
            Trouvez des missions de livraison et de transport près de chez vous
          </p>
        </div>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={() => window.location.reload()}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              <i className="bi bi-funnel me-1"></i>
              Filtrer par statut
            </Form.Label>
            <Form.Select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value={ANNONCE_STATUS.ACTIVE}>Disponibles</option>
              <option value={ANNONCE_STATUS.EN_COURS}>Mes missions en cours</option>
              <option value={ANNONCE_STATUS.TERMINEE}>Mes missions terminées</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearError}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}
      
      {/* Zone d'affichage */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Chargement des missions disponibles...</p>
        </div>
      ) : (
        <>
          {/* Compteur de résultats */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-1">
                <i className="bi bi-list-check me-2"></i>
                {filteredAnnonces.length} mission{filteredAnnonces.length !== 1 ? 's' : ''} 
                {filtreStatut && ` • ${filtreStatut.toLowerCase()}`}
              </h5>
              {annonces.length > 0 && (
                <small className="text-muted">
                  Total disponible : {annonces.length} annonce{annonces.length !== 1 ? 's' : ''}
                </small>
              )}
            </div>
            
            {filtreStatut && (
              <Badge bg="primary" className="fs-6">
                Filtre actif
              </Badge>
            )}
          </div>

          {/* Liste des annonces */}
          {filteredAnnonces.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted opacity-50"></i>
              <h4 className="text-muted mt-3">
                {filtreStatut ? 'Aucune mission trouvée' : 'Aucune mission disponible'}
              </h4>
              <p className="text-muted">
                {filtreStatut 
                  ? 'Essayez de modifier le filtre pour voir plus de missions'
                  : 'Revenez plus tard pour découvrir de nouvelles opportunités'
                }
              </p>
              {filtreStatut && (
                <Button 
                  variant="outline-primary"
                  onClick={() => setFiltreStatut('')}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Voir toutes les missions
                </Button>
              )}
            </div>
          ) : (
            <Row>
              {filteredAnnonces.map(annonce => (
                <Col md={6} lg={4} className="mb-4" key={annonce.id}>
                  <LivreurAnnonceCard annonce={annonce} />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default LivreurAnnonces;
