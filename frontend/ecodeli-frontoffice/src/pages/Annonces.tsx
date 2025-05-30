import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useAnnonces } from '../hooks/useAnnonces';
import { ANNONCE_TYPE_CONFIG, ANNONCE_TYPES } from '../constants/appConfig';
import { AnnonceType } from '../types';
import { AnnonceCard } from '../components/annonces';

/**
 * Page d'affichage des annonces EcoDeli - Connectée à la base de données
 * Interface simplifiée avec filtres en haut de page - Utilise le composant AnnonceCard unifié
 */
const Annonces: React.FC = () => {
  // Hook pour récupérer les annonces depuis la BDD
  const { annonces, isLoading, error, clearError } = useAnnonces();
  
  // États locaux pour les filtres de recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnnonceType, setFilterAnnonceType] = useState<AnnonceType | ''>('');

  // Filtrage côté client des annonces récupérées
  const filteredAnnonces = annonces.filter((annonce) => {
    const matchesSearch = searchTerm === '' || 
      annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annonce.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAnnonceType = filterAnnonceType === '' || annonce.typeAnnonce === filterAnnonceType;
    
    return matchesSearch && matchesAnnonceType;
  });

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    setSearchTerm('');
    setFilterAnnonceType('');
  };

  /**
   * Gestion des actions sur les annonces
   */
  const handleAnnonceAction = (action: string, annonce: any) => {
    switch (action) {
      case 'view':
        console.log('Voir détails de l\'annonce:', annonce.id);
        // TODO: Implémenter la navigation vers la page de détail
        break;
      case 'contact':
        console.log('Contacter pour l\'annonce:', annonce.id);
        // TODO: Implémenter la messagerie
        break;
      default:
        console.log('Action non reconnue:', action);
    }
  };

  return (
    <Container className="py-4">
      {/* En-tête de la page */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary mb-3">
            <i className="bi bi-megaphone me-2"></i>
            Annonces EcoDeli
          </h1>
          <p className="text-muted">
            Découvrez les services disponibles : livraisons, transport de personnes, services à domicile et bien plus !
          </p>
        </Col>
      </Row>

      {/* Affichage des erreurs de chargement */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearError}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Barre de filtres simplifiée */}
      <Row className="mb-4">
        <Col md={5}>
          <Form.Group>
            <Form.Label>
              <i className="bi bi-search me-1"></i>
              Rechercher par nom
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Rechercher dans les titres et descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group>
            <Form.Label>
              <i className="bi bi-tag me-1"></i>
              Type d'annonce
            </Form.Label>
            <Form.Select
              value={filterAnnonceType}
              onChange={(e) => setFilterAnnonceType(e.target.value as AnnonceType | '')}
            >
              <option value="">Tous les types d'annonces</option>
              {Object.entries(ANNONCE_TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
          <Button
            variant="outline-secondary"
            onClick={resetFilters}
            disabled={!searchTerm && !filterAnnonceType}
            className="w-100"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Effacer
          </Button>
        </Col>
      </Row>

      {/* Zone d'affichage des annonces */}
      {/* Indicateur de chargement */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2 text-muted">Chargement des annonces depuis la base de données...</p>
        </div>
      ) : (
        <>
          {/* En-tête avec compteur de résultats */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-1">
                <i className="bi bi-list-ul me-2"></i>
                {filteredAnnonces.length} annonce{filteredAnnonces.length !== 1 ? 's' : ''} 
                {filterAnnonceType && ` • ${ANNONCE_TYPE_CONFIG[filterAnnonceType]?.label}`}
              </h5>
              {annonces.length > 0 && (
                <small className="text-muted">
                  Total disponible : {annonces.length} annonce{annonces.length !== 1 ? 's' : ''}
                </small>
              )}
            </div>
            
            {/* Indicateur de filtres actifs */}
            {(filterAnnonceType || searchTerm) && (
              <Badge bg="primary" className="fs-6">
                Filtres actifs
              </Badge>
            )}
          </div>

          {/* Liste des annonces ou message si vide */}
          {filteredAnnonces.length > 0 ? (
            <Row>
              {filteredAnnonces.map((annonce) => (
                <Col md={6} lg={4} key={annonce.id} className="mb-4">
                  <AnnonceCard
                    annonce={annonce}
                    showActions={true}
                    onAction={handleAnnonceAction}
                    variant="default"
                  />
                </Col>
              ))}
            </Row>
          ) : (
            // Message d'absence de résultats
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted opacity-50"></i>
              <h4 className="text-muted mt-3">
                {searchTerm || filterAnnonceType ? 'Aucune annonce trouvée' : 'Aucune annonce disponible'}
              </h4>
              <p className="text-muted">
                {searchTerm || filterAnnonceType
                  ? 'Essayez de modifier vos critères de recherche ou élargissez votre sélection'
                  : 'Il n\'y a pas encore d\'annonces dans la base de données'
                }
              </p>
              {(searchTerm || filterAnnonceType) && (
                <Button 
                  variant="outline-primary"
                  onClick={resetFilters}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Voir toutes les annonces
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Annonces;
