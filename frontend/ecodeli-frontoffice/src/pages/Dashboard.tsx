import React from 'react';
import { Container, Row, Col, Card, Nav, Tab, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { 
  DashboardOverview, 
  DashboardAnnonces, 
  DashboardProfile, 
  getDashboardTabs 
} from '../components/dashboard';

const Dashboard = () => {
  const { currentUser, annonces, loading, error } = useDashboardData();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <Container className="py-5 page-content">
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Vous devez être connecté pour accéder à votre tableau de bord.
        </Alert>
      </Container>
    );
  }

  const tabs = getDashboardTabs(currentUser.user.role);

  const renderTabContent = (tabKey: string) => {
    switch (tabKey) {
      case 'apercu':
        return <DashboardOverview currentUser={currentUser} annonces={annonces} />;
      
      case 'annonces':
        return <DashboardAnnonces annonces={annonces} loading={loading} error={error} />;
      
      case 'profil':
        return <DashboardProfile currentUser={currentUser} annonces={annonces} />;
      
      case 'messages':
        return (
          <div>
            <h4 className="mb-4">Messages</h4>
            <div className="text-center py-5">
              <i className="bi bi-envelope display-1 text-muted"></i>
              <h5 className="mt-3">Aucun message</h5>
              <p className="text-muted">Votre boîte de réception est vide.</p>
              <button 
                onClick={() => navigate('/messages')} 
                className="btn btn-outline-primary"
              >
                Aller à la messagerie
              </button>
            </div>
          </div>
        );

      case 'livraisons':
        return (
          <div>
            <h4 className="mb-4">
              {currentUser?.user?.role === 'LIVREUR' ? 'Mes livraisons' : 'Mes commandes'}
            </h4>
            <div className="text-center py-5">
              <i className={`bi ${currentUser?.user?.role === 'LIVREUR' ? 'bi-truck' : 'bi-box'} display-1 text-muted`}></i>
              <h5 className="mt-3">Aucune livraison</h5>
              <p className="text-muted">
                {currentUser?.user?.role === 'LIVREUR' 
                  ? 'Vous n\'avez pas encore accepté de missions.'
                  : 'Vous n\'avez pas encore de livraisons en cours.'
                }
              </p>
            </div>
          </div>
        );

      case 'contrat':
        return (
          <div>
            <h4 className="mb-4">Mon contrat commerçant</h4>
            <div className="text-center py-5">
              <i className="bi bi-file-text display-1 text-muted"></i>
              <h5 className="mt-3">Aucun contrat actif</h5>
              <p className="text-muted">Vous n'avez pas encore de contrat avec EcoDeli.</p>
              <button 
                onClick={() => navigate('/commercant-contrats')} 
                className="btn btn-primary"
              >
                Demander un contrat
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h4 className="mb-4">Fonctionnalité à venir</h4>
            <div className="text-center py-5">
              <i className="bi bi-tools display-1 text-muted"></i>
              <h5 className="mt-3">En développement</h5>
              <p className="text-muted">Cette fonctionnalité sera bientôt disponible.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Container className="py-5 page-content">
      <h2 className="mb-4">Mon tableau de bord</h2>
      
      <Tab.Container defaultActiveKey="apercu">
        <Row>
          <Col md={3} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Nav variant="pills" className="flex-column">
                  {tabs.map(tab => (
                    <Nav.Item key={tab.key}>
                      <Nav.Link eventKey={tab.key}>
                        <i className={`${tab.icon} me-2`}></i>
                        {tab.title}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Tab.Content>
                  {tabs.map(tab => (
                    <Tab.Pane key={tab.key} eventKey={tab.key}>
                      {renderTabContent(tab.key)}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default Dashboard;
