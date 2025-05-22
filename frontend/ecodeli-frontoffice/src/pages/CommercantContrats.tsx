import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';

interface Contrat {
  id: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  type: string;
  montantMensuel: number;
  paiementAJour: boolean;
  services: string[];
}

const CommercantContrats: React.FC = () => {
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formulaireContrat, setFormulaireContrat] = useState({
    type: 'STANDARD',
    services: ['LIVRAISON_LOCALE']
  });

  useEffect(() => {
    // Simuler une requête API
    setTimeout(() => {
      const mockContrats: Contrat[] = [
        {
          id: 1,
          dateDebut: "2023-01-15",
          dateFin: "2024-01-14",
          statut: "ACTIF",
          type: "PREMIUM",
          montantMensuel: 129.99,
          paiementAJour: true,
          services: ["LIVRAISON_LOCALE", "LACHER_CHARIOT", "STOCKAGE_TEMPORAIRE"]
        },
        {
          id: 2,
          dateDebut: "2022-06-01",
          dateFin: "2023-06-01",
          statut: "EXPIRE",
          type: "STANDARD",
          montantMensuel: 79.99,
          paiementAJour: true,
          services: ["LIVRAISON_LOCALE"]
        }
      ];
      
      setContrats(mockContrats);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'ACTIF': return <Badge bg="success">Actif</Badge>;
      case 'EXPIRE': return <Badge bg="secondary">Expiré</Badge>;
      case 'EN_ATTENTE': return <Badge bg="warning">En attente</Badge>;
      default: return <Badge bg="secondary">{statut}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'STANDARD': return <Badge bg="info">Standard</Badge>;
      case 'PREMIUM': return <Badge bg="primary">Premium</Badge>;
      case 'ENTERPRISE': return <Badge bg="dark">Enterprise</Badge>;
      default: return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler la création d'un nouveau contrat
    const newContract: Contrat = {
      id: Math.floor(Math.random() * 1000),
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      statut: "EN_ATTENTE",
      type: formulaireContrat.type,
      montantMensuel: formulaireContrat.type === 'STANDARD' ? 79.99 : 129.99,
      paiementAJour: true,
      services: formulaireContrat.services
    };
    
    setContrats([...contrats, newContract]);
    setShowModal(false);
    alert("Votre demande de contrat a été envoyée avec succès. Elle sera traitée par notre service commercial.");
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

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mes contrats</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Demander un nouveau contrat
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des contrats...</p>
        </div>
      ) : contrats.length === 0 ? (
        <Card className="border-0 shadow-sm text-center p-5">
          <Card.Body>
            <h5>Vous n'avez pas encore de contrat</h5>
            <p className="text-muted mb-4">
              Pour bénéficier de nos services de livraison en tant que commerçant, vous devez souscrire à un contrat.
            </p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Demander un contrat
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Mensualité</th>
                  <th>Services inclus</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contrats.map(contrat => (
                  <tr key={contrat.id}>
                    <td>#{contrat.id}</td>
                    <td>{getTypeBadge(contrat.type)}</td>
                    <td>{getStatutBadge(contrat.statut)}</td>
                    <td>{new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}</td>
                    <td>{new Date(contrat.dateFin).toLocaleDateString('fr-FR')}</td>
                    <td>{contrat.montantMensuel.toFixed(2)} €/mois</td>
                    <td>
                      {contrat.services.map(service => (
                        <Badge bg="light" text="dark" className="me-1 mb-1" key={service}>
                          {service.replace('_', ' ')}
                        </Badge>
                      ))}
                    </td>
                    <td>
                      {contrat.statut === 'ACTIF' ? (
                        <Button variant="outline-primary" size="sm">
                          Voir détails
                        </Button>
                      ) : contrat.statut === 'EXPIRE' ? (
                        <Button variant="outline-success" size="sm" onClick={() => setShowModal(true)}>
                          Renouveler
                        </Button>
                      ) : (
                        <Button variant="outline-secondary" size="sm" disabled>
                          En attente
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Fenêtre modale de demande de contrat */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Demande de contrat commerçant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Type de contrat</Form.Label>
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
              <Form.Label>Services souhaités</Form.Label>
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
                />
                <Form.Check
                  type="checkbox"
                  id="stockage"
                  label="Stockage temporaire pour vos marchandises"
                  checked={formulaireContrat.services.includes('STOCKAGE_TEMPORAIRE')}
                  onChange={() => handleServiceChange('STOCKAGE_TEMPORAIRE')}
                />
              </div>
            </Form.Group>
            
            <div className="mt-4">
              <h6>Informations sur le contrat</h6>
              <p className="small text-muted">
                En soumettant ce formulaire, vous demandez la création d'un contrat commerçant avec EcoDeli. Un conseiller vous contactera pour finaliser les détails du contrat et vous accompagner dans la mise en place des services.
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