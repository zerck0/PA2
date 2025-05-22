import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CreateAnnonce = () => {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'LIVRAISON',
    villeDepart: '',
    villeArrivee: '',
    dateLivraison: '',
    prix: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Simuler l'envoi des données à l'API
    console.log('Données à envoyer:', formData);
    
    // Rediriger vers la liste des annonces après création
    navigate('/annonces');
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Créer une annonce</h2>
      
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Titre de l'annonce</Form.Label>
              <Form.Control
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Titre décrivant votre besoin"
                required
              />
              <Form.Control.Feedback type="invalid">
                Veuillez entrer un titre pour votre annonce.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez précisément votre besoin, les dimensions, le poids, etc."
                required
              />
              <Form.Control.Feedback type="invalid">
                Veuillez entrer une description.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Type d'annonce</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="LIVRAISON">Livraison de colis</option>
                <option value="TRANSPORT">Transport de meubles/objets volumineux</option>
                <option value="SERVICE">Service à la personne</option>
              </Form.Select>
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ville de départ</Form.Label>
                  <Form.Control
                    type="text"
                    name="villeDepart"
                    value={formData.villeDepart}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer une ville de départ.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ville d'arrivée</Form.Label>
                  <Form.Control
                    type="text"
                    name="villeArrivee"
                    value={formData.villeArrivee}
                    onChange={handleChange}
                    placeholder="Ex: Lyon"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer une ville d'arrivée.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date de livraison souhaitée</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateLivraison"
                    value={formData.dateLivraison}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez sélectionner une date.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Prix proposé (€)</Form.Label>
                  <Form.Control
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer un prix valide.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="outline-secondary" onClick={() => navigate('/annonces')}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Publier l'annonce
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateAnnonce;