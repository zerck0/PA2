import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="display-4 mb-4">Accès non autorisé</h1>
          <p className="lead mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="primary" 
              className="me-3"
            >
              Retour au tableau de bord
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline-secondary"
            >
              Retour à l'accueil
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Unauthorized;