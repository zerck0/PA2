import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      title: "Transport de personnes",
      icon: "person-walking",
      description: "Accompagnement de personnes âgées, enfants ou toute personne ayant besoin d'assistance pour se déplacer.",
      linkText: "En savoir plus",
      link: "/services/transport-personnes"
    },
    {
      title: "Courses et achats",
      icon: "cart-shopping",
      description: "Livraison de courses à domicile, achat de produits spécifiques ou introuvables dans votre région.",
      linkText: "En savoir plus",
      link: "/services/courses"
    },
    {
      title: "Transferts aéroport",
      icon: "plane-departure",
      description: "Service de transport de et vers les aéroports avec possibilité d'assistance pour les bagages.",
      linkText: "En savoir plus",
      link: "/services/transferts"
    },
    {
      title: "Garde d'animaux",
      icon: "paw",
      description: "Service de garde d'animaux à domicile pendant votre absence ou vos déplacements.",
      linkText: "En savoir plus",
      link: "/services/animaux"
    },
    {
      title: "Petits travaux",
      icon: "screwdriver-wrench",
      description: "Services de jardinage, ménage, petites réparations pendant que vous êtes absents.",
      linkText: "En savoir plus",
      link: "/services/travaux"
    },
    {
      title: "Lâcher de chariot",
      icon: "cart-flatbed",
      description: "Service pour commerçants permettant à vos clients de faire leurs achats et se faire livrer à domicile.",
      linkText: "En savoir plus",
      link: "/services/chariot"
    }
  ];

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold mb-3">Nos services à la personne</h2>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
          Découvrez notre gamme complète de services à la personne, assurés par des prestataires vérifiés et formés pour vous garantir qualité et sécurité.
        </p>
      </div>
      
      <Row className="g-4">
        {services.map((service, index) => (
          <Col md={6} lg={4} key={index}>
            <Card className="h-100 border-0 shadow-sm hover-card">
              <Card.Body className="d-flex flex-column text-center p-4">
                <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className={`bi bi-${service.icon} text-primary fs-1`}></i>
                </div>
                <Card.Title className="mb-3">{service.title}</Card.Title>
                <Card.Text className="text-muted mb-4">
                  {service.description}
                </Card.Text>
                <div className="mt-auto">
                  <Link to={service.link} className="btn btn-outline-primary">
                    {service.linkText}
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <div className="text-center mt-5">
        <h3 className="mb-4">Vous ne trouvez pas ce que vous cherchez?</h3>
        <Button as={Link} to="/contact" variant="primary" size="lg">
          Contactez-nous pour un service personnalisé
        </Button>
      </div>
    </Container>
  );
};

export default Services;