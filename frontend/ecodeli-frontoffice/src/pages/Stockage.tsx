import { Container, Row, Col, Card, Button, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Stockage = () => {
  const cities = [
    { name: "Paris", address: "110, rue de Flandre, 75019 Paris", size: "500m²" },
    { name: "Lyon", address: "15, rue de la République, 69002 Lyon", size: "350m²" },
    { name: "Marseille", address: "45, avenue du Prado, 13008 Marseille", size: "400m²" },
    { name: "Lille", address: "22, rue Faidherbe, 59000 Lille", size: "300m²" }
  ];

  const faqs = [
    {
      question: "Combien de temps puis-je stocker mes affaires ?",
      answer: "Nous proposons des solutions de stockage temporaire allant de quelques heures à plusieurs semaines. La durée est flexible et s'adapte à vos besoins."
    },
    {
      question: "Comment accéder à mes affaires pendant la période de stockage ?",
      answer: "Vous pouvez accéder à vos affaires pendant les heures d'ouverture de nos entrepôts. Pour certaines formules, un accès 24h/24 est possible sur demande."
    },
    {
      question: "Mes affaires sont-elles assurées pendant le stockage ?",
      answer: "Une assurance de base est incluse dans nos tarifs. Des options d'assurance complémentaires sont disponibles pour une couverture plus étendue."
    },
    {
      question: "Quels types d'articles puis-je stocker ?",
      answer: "Nous acceptons la plupart des objets non périssables et non dangereux. Les denrées alimentaires, produits inflammables ou illégaux sont interdits."
    },
    {
      question: "Comment réserver un espace de stockage ?",
      answer: "Vous pouvez réserver directement en ligne via notre plateforme ou contacter notre service client pour une demande personnalisée."
    }
  ];

  return (
    <>
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">Stockage temporaire</h1>
              <p className="lead mb-4">
                Des espaces de stockage sécurisés disponibles dans toute la France pour vos besoins temporaires de transit ou d'entreposage.
              </p>
              <Button as={Link} to="/register" variant="light" size="lg" className="me-3">
                Réserver un espace
              </Button>
              <Button as={Link} to="/contact" variant="outline-light" size="lg">
                Nous contacter
              </Button>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <h2 className="text-center mb-5">Nos espaces de stockage</h2>
        <Row className="g-4">
          {cities.map((city, index) => (
            <Col md={6} lg={3} key={index}>
              <Card className="h-100 border-0 shadow-sm hover-card">
                <Card.Body className="text-center p-4">
                  <h3>{city.name}</h3>
                  <p className="text-muted mb-3">{city.address}</p>
                  <p className="mb-4">
                    <span className="badge bg-primary">Espace total : {city.size}</span>
                  </p>
                  <Button as={Link} to={`/stockage/${city.name.toLowerCase()}`} variant="outline-primary">
                    Voir les disponibilités
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">Questions fréquentes</h2>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Accordion>
                {faqs.map((faq, index) => (
                  <Accordion.Item eventKey={index.toString()} key={index}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>
                      {faq.answer}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <div className="text-center">
          <h2 className="mb-4">Vous avez d'autres questions ?</h2>
          <Button as={Link} to="/contact" variant="primary" size="lg">
            Contactez-nous
          </Button>
        </div>
      </Container>
    </>
  );
};

export default Stockage;