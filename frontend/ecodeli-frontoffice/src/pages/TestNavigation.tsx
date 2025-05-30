import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { useAuthGuard } from '../hooks/useAuthGuard';
import LoginPrompt from '../components/LoginPrompt';

const TestNavigation = () => {
  const { requireAuth, isAuthenticated } = useAuthGuard();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleCreateAnnonce = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    // Action pour utilisateur connecté
    alert('Redirection vers la création d\'annonce...');
  };

  const handleAdvancedAction = () => {
    requireAuth(() => {
      alert('Action avancée exécutée pour utilisateur connecté !');
    });
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    alert('Messagerie ouverte...');
  };

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="mb-4">
            <i className="bi bi-gear-fill me-2"></i>
            Test du système de navigation
          </h1>
          
          <Alert variant="info" className="mb-4">
            <i className="bi bi-info-circle-fill me-2"></i>
            <strong>État de connexion :</strong> {isAuthenticated ? (
              <>
                <i className="bi bi-check-circle-fill text-success me-1"></i>
                Connecté
              </>
            ) : (
              <>
                <i className="bi bi-x-circle-fill text-danger me-1"></i>
                Non connecté
              </>
            )}
          </Alert>

          <Row>
            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Header>
                  <h5>
                    <i className="bi bi-unlock-fill me-2"></i>
                    Actions publiques
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p>Ces actions sont accessibles à tous les visiteurs :</p>
                  <div className="d-grid gap-2">
                    <Button variant="outline-primary" href="/annonces">
                      <i className="bi bi-megaphone me-2"></i>
                      Voir les annonces
                    </Button>
                    <Button variant="outline-info" href="/how-it-works">
                      <i className="bi bi-question-circle me-2"></i>
                      Comment ça marche
                    </Button>
                    <Button variant="outline-secondary" href="/contact">
                      <i className="bi bi-envelope me-2"></i>
                      Contact
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Header>
                  <h5>
                    <i className="bi bi-lock-fill me-2"></i>
                    Actions nécessitant une connexion
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p>Ces actions déclenchent une demande de connexion :</p>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleCreateAnnonce}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Créer une annonce
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={handleAdvancedAction}
                    >
                      <i className="bi bi-speedometer2 me-2"></i>
                      Accéder au dashboard
                    </Button>
                    <Button 
                      variant="warning" 
                      onClick={handleContactSeller}
                    >
                      <i className="bi bi-chat-dots me-2"></i>
                      Contacter un vendeur
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col>
              <Card>
                <Card.Header>
                  <h5>
                    <i className="bi bi-target me-2"></i>
                    Test de navigation avec redirection
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p>
                    Testez le système de redirection automatique après connexion.
                    Cliquez sur un lien nécessitant une connexion, connectez-vous,
                    et vous serez automatiquement redirigé vers la page souhaitée.
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => requireAuth(() => window.location.href = '/dashboard')}
                    >
                      <i className="bi bi-speedometer2 me-1"></i>
                      Dashboard
                    </Button>
                    <Button 
                      variant="outline-success" 
                      onClick={() => requireAuth(() => window.location.href = '/annonces/creer')}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Créer annonce
                    </Button>
                    <Button 
                      variant="outline-info" 
                      onClick={() => requireAuth(() => window.location.href = '/messages')}
                    >
                      <i className="bi bi-chat-dots me-1"></i>
                      Messages
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <LoginPrompt
            show={showLoginPrompt}
            onHide={() => setShowLoginPrompt(false)}
            title="Connexion requise"
            message="Vous devez être connecté pour accéder à cette fonctionnalité."
          />
        </Col>
      </Row>
    </Container>
  );
};

export default TestNavigation;
