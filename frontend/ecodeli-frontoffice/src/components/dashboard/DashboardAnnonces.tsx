import React from 'react';
import { Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AnnonceCard } from '../annonces';
import { Annonce } from '../../types';

interface DashboardAnnoncesProps {
  annonces: Annonce[];
  loading: boolean;
  error: string;
}

/**
 * Composant d'affichage des annonces dans le dashboard utilisateur
 * Utilise le composant AnnonceCard unifié avec actions spécifiques dashboard
 */
const DashboardAnnonces: React.FC<DashboardAnnoncesProps> = ({ annonces, loading, error }) => {
  const navigate = useNavigate();

  /**
   * Gestion des actions sur les annonces depuis le dashboard
   */
  const handleDashboardAction = (action: string, annonce: Annonce) => {
    switch (action) {
      case 'view':
        console.log('Voir détails de l\'annonce:', annonce.id);
        // TODO: Implémenter la navigation vers la page de détail
        break;
      case 'edit':
        console.log('Modifier l\'annonce:', annonce.id);
        // TODO: Implémenter la modification d'annonce
        navigate(`/annonces/edit/${annonce.id}`);
        break;
      case 'delete':
        console.log('Supprimer l\'annonce:', annonce.id);
        // TODO: Implémenter la suppression d'annonce
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
          // API call pour supprimer
        }
        break;
      case 'duplicate':
        console.log('Dupliquer l\'annonce:', annonce.id);
        // TODO: Implémenter la duplication d'annonce
        break;
      default:
        console.log('Action non reconnue:', action);
    }
  };

  /**
   * Composant AnnonceCard adapté pour le dashboard avec actions de gestion
   */
  const DashboardAnnonceCard: React.FC<{ annonce: Annonce }> = ({ annonce }) => {
    return (
      <div className="position-relative">
        <AnnonceCard
          annonce={annonce}
          showActions={false} // On gère les actions manuellement
          variant="compact"
        />
        
        {/* Actions de gestion en overlay */}
        <div className="position-absolute bottom-0 end-0 start-0 p-3 bg-white border-top">
          <div className="d-grid gap-2">
            <div className="btn-group" role="group">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleDashboardAction('view', annonce)}
              >
                <i className="bi bi-eye"></i>
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => handleDashboardAction('edit', annonce)}
                title="Modifier"
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button 
                variant="outline-info" 
                size="sm"
                onClick={() => handleDashboardAction('duplicate', annonce)}
                title="Dupliquer"
              >
                <i className="bi bi-files"></i>
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => handleDashboardAction('delete', annonce)}
                title="Supprimer"
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="bi bi-megaphone me-2"></i>
          Mes annonces
        </h4>
        <Button 
          onClick={() => navigate('/annonces/creer')} 
          variant="primary" 
          size="sm"
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle annonce
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Chargement de vos annonces...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      ) : annonces.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-megaphone display-1 text-muted opacity-50"></i>
          <h5 className="mt-3 text-muted">Aucune annonce</h5>
          <p className="text-muted">Vous n'avez pas encore créé d'annonces.</p>
          <Button 
            onClick={() => navigate('/annonces/creer')} 
            variant="primary"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Créer ma première annonce
          </Button>
        </div>
      ) : (
        <>
          {/* Compteur d'annonces */}
          <div className="mb-3">
            <small className="text-muted">
              <i className="bi bi-list-ul me-1"></i>
              {annonces.length} annonce{annonces.length !== 1 ? 's' : ''} créée{annonces.length !== 1 ? 's' : ''}
            </small>
          </div>

          {/* Grille des annonces */}
          <Row>
            {annonces.map(annonce => (
              <Col md={6} lg={4} key={annonce.id} className="mb-4">
                <DashboardAnnonceCard annonce={annonce} />
              </Col>
            ))}
          </Row>

          {/* Bouton pour créer une nouvelle annonce */}
          <div className="text-center mt-4">
            <Button 
              onClick={() => navigate('/annonces/creer')} 
              variant="outline-primary"
              size="lg"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Créer une nouvelle annonce
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAnnonces;
