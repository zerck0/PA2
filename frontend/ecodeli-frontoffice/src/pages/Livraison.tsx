import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Livraison = () => {
  return (
    <>
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">Livraison de colis</h1>
              <p className="lead mb-4">
                Envoyez vos colis partout en France de façon économique, écologique et solidaire grâce à notre réseau de livreurs partenaires.
              </p>
              <Button as={Link} to="/register" variant="light" size="lg" className="me-3">
                Envoyer un colis
              </Button>
              <Button as={Link} to="/devenir-livreur" variant="outline-light" size="lg">
                Devenir livreur
              </Button>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <h2 className="text-center mb-5">Comment ça fonctionne</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">1</div>
                <Card.Title>Publiez votre annonce</Card.Title>
                <Card.Text>
                  Décrivez votre colis, indiquez les adresses de départ et d'arrivée, ainsi que vos disponibilités.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">2</div>
                <Card.Title>Choisissez votre livreur</Card.Title>
                <Card.Text>
                  Recevez des propositions de livreurs et sélectionnez celle qui vous convient le mieux.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">3</div>
                <Card.Title>Suivez votre livraison</Card.Title>
                <Card.Text>
                  Suivez en temps réel l'avancement de votre livraison et recevez des notifications.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">Calculez le coût de votre livraison</h2>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="border-0 shadow">
                <Card.Body className="p-4">
                  <Form>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ville de départ</Form.Label>
                          <Form.Control type="text" placeholder="Ex: Paris" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ville d'arrivée</Form.Label>
                          <Form.Control type="text" placeholder="Ex: Lyon" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Poids du colis</Form.Label>
                          <Form.Control type="number" placeholder="En kg" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dimensions</Form.Label>
                          <Form.Select>
                            <option>Petit (max 30x20x10cm)</option>
                            <option>Moyen (max 50x40x20cm)</option>
                            <option>Grand (max 80x60x40cm)</option>
                            <option>Très grand (sur devis)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="text-center">
                      <Button variant="primary" size="lg" className="px-5">
                        Calculer
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Livraison;