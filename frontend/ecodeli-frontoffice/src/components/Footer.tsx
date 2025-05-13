import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#2D8A3E', color: 'white' }} className="py-4 mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5 style={{ fontFamily: 'Yeseva One, serif' }}>EcoDeli</h5>
            <p className="mb-0">Livraison éco-responsable et solidaire</p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0 text-md-center">
            <p className="mb-0">© 2025 EcoDeli. Tous droits réservés.</p>
          </Col>
          <Col md={4} className="text-md-end">
            <Link to="/contact" className="text-white text-decoration-none me-3">Contact</Link>
            <Link to="/terms" className="text-white text-decoration-none">CGU</Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;