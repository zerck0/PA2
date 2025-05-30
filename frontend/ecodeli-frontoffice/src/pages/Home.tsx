import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logoEco from '../assets/logoEco.png';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Section Welcome */}
      <Container className="my-5 pt-5">
        <Row className="text-center mb-5">
          <Col>
            <img 
              src={logoEco} 
              alt="EcoDeli" 
              height="80" 
              className="mb-4"
              style={{ maxWidth: '200px' }}
            />
            <h1 className="display-4 text-primary mb-3" style={{ fontFamily: 'Yeseva One, serif' }}>
              EcoDeli
            </h1>
            <h2 className="h4 text-secondary mb-4">
              Livraison éco-responsable et solidaire
            </h2>
            <p className="lead mb-5 text-muted">
              Rejoignez notre communauté de livreurs et d'expéditeurs pour des livraisons plus vertes,
              plus économiques et plus humaines.
            </p>
            <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
              <Button 
                variant="primary" 
                size="lg" 
                className="btn-primary"
                onClick={() => navigate('/register')}
              >
                Rejoindre la communauté
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={() => navigate('/how-it-works')}
              >
                Comment ça marche ?
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Section Services */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <Container>
          <h2 className="text-center mb-5 text-primary">
            Nos services
          </h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-card">
                <Card.Body className="text-center p-4">
                  <div className="icon-wrapper rounded-circle p-3 mx-auto mb-4" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(45, 138, 62, 0.1)' }}>
                    <i className="bi bi-box-seam fs-1 text-primary"></i>
                  </div>
                  <Card.Title>Livraison de colis</Card.Title>
                  <Card.Text>
                    Envoyez vos colis partout en France grâce à notre réseau de livreurs partenaires.
                    Économique, rapide et écologique !
                  </Card.Text>
                  <Button 
                    variant="outline-primary" 
                    className="mt-3"
                    onClick={() => navigate('/livraison')}
                  >
                    En savoir plus
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-card">
                <Card.Body className="text-center p-4">
                  <div className="icon-wrapper rounded-circle p-3 mx-auto mb-4" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(45, 138, 62, 0.1)' }}>
                    <i className="bi bi-person-lines-fill fs-1 text-primary"></i>
                  </div>
                  <Card.Title>Services à la personne</Card.Title>
                  <Card.Text>
                    Transport, accompagnement, courses... Nos prestataires sont là pour vous aider
                    dans votre quotidien.
                  </Card.Text>
                  <Button 
                    variant="outline-primary" 
                    className="mt-3"
                    onClick={() => navigate('/services')}
                  >
                    En savoir plus
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-card">
                <Card.Body className="text-center p-4">
                  <div className="icon-wrapper rounded-circle p-3 mx-auto mb-4" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(45, 138, 62, 0.1)' }}>
                    <i className="bi bi-box fs-1 text-primary"></i>
                  </div>
                  <Card.Title>Stockage temporaire</Card.Title>
                  <Card.Text>
                    Besoin de stocker vos colis pendant leur transit ? Nos box sont sécurisées
                    et disponibles dans toute la France.
                  </Card.Text>
                  <Button 
                    variant="outline-primary" 
                    className="mt-3"
                    onClick={() => navigate('/stockage')}
                  >
                    En savoir plus
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 text-primary">
            Comment ça marche ?
          </h2>
          <Row>
            <Col lg={3} md={6} className="mb-4">
              <div className="text-center">
                <div className="step-circle mx-auto mb-4">1</div>
                <h5>Inscription</h5>
                <p>Créez votre compte en quelques clics et rejoignez la communauté EcoDeli</p>
              </div>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <div className="text-center">
                <div className="step-circle mx-auto mb-4">2</div>
                <h5>Déposez une annonce</h5>
                <p>Précisez votre besoin de livraison ou de service</p>
              </div>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <div className="text-center">
                <div className="step-circle mx-auto mb-4">3</div>
                <h5>Recevez des offres</h5>
                <p>Nos livreurs et prestataires vous contactent avec leurs propositions</p>
              </div>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <div className="text-center">
                <div className="step-circle mx-auto mb-4">4</div>
                <h5>Livraison sécurisée</h5>
                <p>Validez la livraison et payez en toute sécurité</p>
              </div>
            </Col>
          </Row>
          
          <div className="text-center mt-4">
            <Button 
              variant="primary" 
              size="lg"
              className="btn-primary"
              onClick={() => navigate('/register')}
            >
              Commencer maintenant
            </Button>
          </div>
        </Container>
      </section>

      {/* Section Nos engagements */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <Container>
          <h2 className="text-center mb-5 text-primary">
            Nos engagements
          </h2>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-card">
                <div className="icon-wrapper rounded-circle p-3 mx-auto mb-3" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(45, 138, 62, 0.1)' }}>
                  <i className="bi bi-globe fs-2 text-primary"></i>
                </div>
                <h5>Impact environnemental réduit</h5>
                <p className="text-muted">
                  Nous optimisons les trajets pour limiter l'empreinte carbone des livraisons
                </p>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-card">
                <div className="icon-wrapper rounded-circle p-3 mx-auto mb-3" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(27, 60, 115, 0.1)' }}>
                  <i className="bi bi-shield-check fs-2" style={{ color: '#1B3C73' }}></i>
                </div>
                <h5>Sécurité garantie</h5>
                <p className="text-muted">
                  Tous nos livreurs sont vérifiés et vos colis sont assurés
                </p>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-card">
                <div className="icon-wrapper rounded-circle p-3 mx-auto mb-3" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(45, 138, 62, 0.1)' }}>
                  <i className="bi bi-people fs-2 text-primary"></i>
                </div>
                <h5>Économie solidaire</h5>
                <p className="text-muted">
                  Nous créons du lien social et soutenons le pouvoir d'achat
                </p>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-card">
                <div className="icon-wrapper rounded-circle p-3 mx-auto mb-3" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(27, 60, 115, 0.1)' }}>
                  <i className="bi bi-wallet2 fs-2" style={{ color: '#1B3C73' }}></i>
                </div>
                <h5>Prix transparents</h5>
                <p className="text-muted">
                  Pas de frais cachés, vous ne payez que ce que vous voyez
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;
