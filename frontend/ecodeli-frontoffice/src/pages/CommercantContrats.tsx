import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';

interface ContratDemande {
  type: 'STANDARD' | 'PREMIUM';
  services: string[];
}

const CommercantContrats: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formulaireContrat, setFormulaireContrat] = useState<ContratDemande>({
    type: 'STANDARD',
    services: ['LIVRAISON_LOCALE']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'API pour créer une demande de contrat
    setSuccess(true);
    setShowModal(false);
    setTimeout(() => setSuccess(false), 5000);
  };

  const handleServiceChange = (service: string) => {
    setFormulaireContrat(prev => {
      if (prev.services.includes(service)) {
        return { ...prev, services: prev.services.filter(s => s !== service) };
      } else {
        return { ...prev, services: [...prev.services, service] };
      }
    });
  };

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Vous devez être connecté pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mes contrats</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Demander un nouveau contrat
        </Button>
      </div>

      {success && (
        <Alert variant="success" className="mb-4">
          <i className="bi bi-check-circle me-2"></i>
          Votre demande de contrat a été envoyée avec succès. Notre équipe commerciale vous contactera sous 48h.
        </Alert>
      )}

      <Card className="border-0 shadow-sm text-center p-5">
        <Card.Body>
          <i className="bi bi-file-earmark-text display-1 text-muted mb-4"></i>
          <h5>Aucun contrat actif</h5>
          <p className="text-muted mb-4">
            Pour bénéficier de nos services de livraison en tant que commerçant, vous devez souscrire à un contrat.
            Nos offres sont conçues pour s'adapter à vos besoins spécifiques.
          </p>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Demander un contrat
          </Button>
        </Card.Body>
      </Card>

      {/* Informations sur les offres */}
      <Row className="mt-5">
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-3">
                <Badge bg="info" className="fs-6 px-3 py-2">STANDARD</Badge>
              </div>
              <h4 className="text-center">79,99 € / mois</h4>
              <ul className="list-unstyled mt-4">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Livraison locale dans un rayon de 20km
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Interface de gestion des commandes
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Support client email
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Commission réduite de 5%
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm border-primary">
            <Card.Body className="p-4">
              <div className="text-center mb-3">
                <Badge bg="primary" className="fs-6 px-3 py-2">PREMIUM</Badge>
              </div>
              <h4 className="text-center">129,99 € / mois</h4>
              <ul className="list-unstyled mt-4">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Livraison locale dans un rayon de 50km
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Service "Lâcher de chariot"
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Stockage temporaire inclus
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Support client prioritaire
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Commission réduite de 3%
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Analytics avancées
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Fenêtre modale de demande de contrat */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Demande de contrat commerçant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Type de contrat *</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  id="standard"
                  name="type"
                  label="Standard (79,99 €/mois)"
                  checked={formulaireContrat.type === 'STANDARD'}
                  onChange={() => setFormulaireContrat(prev => ({ ...prev, type: 'STANDARD' }))}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="premium"
                  name="type"
                  label="Premium (129,99 €/mois)"
                  checked={formulaireContrat.type === 'PREMIUM'}
                  onChange={() => setFormulaireContrat(prev => ({ ...prev, type: 'PREMIUM' }))}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Services souhaités *</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="livraison"
                  label="Livraison locale"
                  checked={formulaireContrat.services.includes('LIVRAISON_LOCALE')}
                  onChange={() => handleServiceChange('LIVRAISON_LOCALE')}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="chariot"
                  label="Lâcher de chariot (vos clients font leurs courses et se font livrer)"
                  checked={formulaireContrat.services.includes('LACHER_CHARIOT')}
                  onChange={() => handleServiceChange('LACHER_CHARIOT')}
                  className="mb-2"
                  disabled={formulaireContrat.type === 'STANDARD'}
                />
                <Form.Check
                  type="checkbox"
                  id="stockage"
                  label="Stockage temporaire pour vos marchandises"
                  checked={formulaireContrat.services.includes('STOCKAGE_TEMPORAIRE')}
                  onChange={() => handleServiceChange('STOCKAGE_TEMPORAIRE')}
                  disabled={formulaireContrat.type === 'STANDARD'}
                />
              </div>
              {formulaireContrat.type === 'STANDARD' && (
                <Form.Text className="text-muted">
                  Les services avancés nécessitent un contrat Premium
                </Form.Text>
              )}
            </Form.Group>
            
            <div className="mt-4">
              <h6>Informations importantes</h6>
              <p className="small text-muted">
                En soumettant ce formulaire, vous demandez la création d'un contrat commerçant avec EcoDeli. 
                Un conseiller vous contactera sous 48h pour finaliser les détails du contrat et vous accompagner 
                dans la mise en place des services.
              </p>
              <p className="small text-muted">
                <strong>Engagement :</strong> Contrat d'1 an minimum, résiliable avec un préavis de 30 jours.
              </p>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Envoyer la demande
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CommercantContrats;
