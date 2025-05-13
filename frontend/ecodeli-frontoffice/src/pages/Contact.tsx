import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const Contact = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({
        nom: '',
        email: '',
        sujet: '',
        message: ''
      });
      setValidated(false);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'envoi du message');
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col lg={6} className="mb-4 mb-lg-0">
          <h2 className="mb-4">Contactez-nous</h2>
          <p className="lead mb-4">
            Une question, une suggestion ? N'hésitez pas à nous contacter. 
            Notre équipe est à votre disposition pour vous répondre dans les plus brefs délais.
          </p>
          
          <div className="mb-4">
            <h5>Notre adresse</h5>
            <p className="mb-0">
              <i className="bi bi-geo-alt text-primary me-2"></i>
              110, rue de Flandre, 75019 Paris
            </p>
          </div>
          
          <div className="mb-4">
            <h5>Téléphone</h5>
            <p className="mb-0">
              <i className="bi bi-telephone text-primary me-2"></i>
              +33 1 23 45 67 89
            </p>
          </div>
          
          <div className="mb-4">
            <h5>Email</h5>
            <p className="mb-0">
              <i className="bi bi-envelope text-primary me-2"></i>
              contact@ecodeli.fr
            </p>
          </div>
          
          <div className="mb-4">
            <h5>Suivez-nous</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-dark fs-4">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-dark fs-4">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="text-dark fs-4">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-dark fs-4">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </Col>
        
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="mb-4">Envoyez-nous un message</h4>
              
              {submitted && (
                <Alert variant="success">
                  <i className="bi bi-check-circle me-2"></i>
                  Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.
                </Alert>
              )}
              
              {error && (
                <Alert variant="danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}
              
              {!submitted && (
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom complet</Form.Label>
                    <Form.Control
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Votre nom et prénom"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Veuillez entrer votre nom.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Votre adresse email"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Veuillez entrer une adresse email valide.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Sujet</Form.Label>
                    <Form.Control
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      placeholder="Sujet de votre message"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Veuillez entrer un sujet.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Votre message"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Veuillez entrer votre message.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Button variant="primary" type="submit">
                    <i className="bi bi-send me-2"></i>
                    Envoyer le message
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;