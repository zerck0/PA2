import React from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Annonce } from '../../types/annonce';
import { AuthResponse } from '../../services/authService';

interface DashboardOverviewProps {
  currentUser: AuthResponse;
  annonces: Annonce[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ currentUser, annonces }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Bonjour {currentUser?.user?.prenom} {currentUser?.user?.nom}</h4>
        <Badge bg="primary">{currentUser?.user?.role}</Badge>
      </div>
      
      <Row>
        <Col md={4}>
          <Card className="border-0 bg-primary text-white mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Mes annonces</h5>
                  <h3>{annonces.length}</h3>
                </div>
                <i className="bi bi-megaphone fs-1"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 bg-success text-white mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Annonces actives</h5>
                  <h3>{annonces.filter(a => a.statut === 'ACTIVE').length}</h3>
                </div>
                <i className="bi bi-check-circle fs-1"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 bg-info text-white mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Messages</h5>
                  <h3>0</h3>
                </div>
                <i className="bi bi-envelope fs-1"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-4">
        <h5>Actions rapides</h5>
        <div className="d-flex gap-2 flex-wrap">
          <Button onClick={() => navigate('/annonces/creer')} variant="primary">
            <i className="bi bi-plus-circle me-2"></i>
            Créer une annonce
          </Button>
          <Button onClick={() => navigate('/annonces')} variant="outline-primary">
            <i className="bi bi-search me-2"></i>
            Parcourir les annonces
          </Button>
          {currentUser?.user?.role === 'LIVREUR' && (
            <Button onClick={() => navigate('/livreur-annonces')} variant="outline-success">
              <i className="bi bi-truck me-2"></i>
              Voir les missions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
