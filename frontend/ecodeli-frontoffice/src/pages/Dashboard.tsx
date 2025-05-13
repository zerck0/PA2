import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';

const Dashboard = () => {
  return (
    <Container className="py-5">
      <h2 className="mb-4">Mon tableau de bord</h2>
      
      <Tab.Container defaultActiveKey="annonces">
        <Row>
          <Col md={3} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="annonces">Mes annonces</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="livraisons">Mes livraisons</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="favoris">Favoris</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="messages">Messages</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="paiements">Paiements</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="profil">Mon profil</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="annonces">
                    <h4 className="mb-4">Mes annonces</h4>
                    <p>Vous n'avez pas encore publié d'annonces.</p>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="livraisons">
                    <h4 className="mb-4">Mes livraisons</h4>
                    <p>Aucune livraison en cours.</p>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="favoris">
                    <h4 className="mb-4">Mes favoris</h4>
                    <p>Vous n'avez pas encore ajouté d'annonces à vos favoris.</p>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="messages">
                    <h4 className="mb-4">Mes messages</h4>
                    <p>Vous n'avez pas de nouveaux messages.</p>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="paiements">
                    <h4 className="mb-4">Mes paiements</h4>
                    <p>Aucune transaction effectuée.</p>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="profil">
                    <h4 className="mb-4">Mon profil</h4>
                    <p>Informations personnelles</p>
                  </Tab.Pane>
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