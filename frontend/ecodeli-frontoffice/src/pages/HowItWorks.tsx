import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-5">
        <Col lg={8} className="text-center">
          <h1 className="display-4 fw-bold mb-4">Comment fonctionne EcoDeli ?</h1>
          <p className="lead">
            Découvrez notre fonctionnement simple et efficace pour des livraisons écologiques et solidaires.
          </p>
        </Col>
      </Row>

      <div className="py-4">
        <h2 className="text-center mb-5">Pour les expéditeurs</h2>
        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">1</div>
                <Card.Title>Inscription</Card.Title>
                <Card.Text>
                  Créez votre compte gratuitement en quelques clics et complétez votre profil.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">2</div>
                <Card.Title>Déposez une annonce</Card.Title>
                <Card.Text>
                  Décrivez votre colis, le trajet souhaité et proposez un prix.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">3</div>
                <Card.Title>Choisissez un livreur</Card.Title>
                <Card.Text>
                  Sélectionnez le livreur qui vous correspond parmi les propositions reçues.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">4</div>
                <Card.Title>Suivez la livraison</Card.Title>
                <Card.Text>
                  Suivez en temps réel le trajet de votre colis jusqu'à sa destination.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="py-4 mt-5">
        <h2 className="text-center mb-5">Pour les livreurs</h2>
        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">1</div>
                <Card.Title>Inscription</Card.Title>
                <Card.Text>
                  Créez votre profil de livreur et téléchargez les documents requis.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">2</div>
                <Card.Title>Parcourez les annonces</Card.Title>
                <Card.Text>
                  Trouvez des livraisons qui correspondent à vos trajets prévus.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">3</div>
                <Card.Title>Proposez vos services</Card.Title>
                <Card.Text>
                  Faites votre proposition et échangez avec l'expéditeur pour confirmer les détails.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="step-circle mx-auto mb-4">4</div>
                <Card.Title>Effectuez la livraison</Card.Title>
                <Card.Text>
                  Livrez le colis et recevez votre paiement dès la confirmation de livraison.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="text-center mt-5 py-4">
        <h2 className="mb-4">Prêt à commencer ?</h2>
        <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
          Créer un compte
        </Button>
        <Button as={Link} to="/contact" variant="outline-primary" size="lg">
          Des questions ?
        </Button>
      </div>
    </Container>
  );
};

export default HowItWorks;