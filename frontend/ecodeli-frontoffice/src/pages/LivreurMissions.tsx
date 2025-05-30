import React from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';

const LivreurMissions = () => {
  // Données factices pour la démonstration
  const missions = [
    {
      id: 1,
      title: "Livraison express - Colis fragile",
      client: "Marie Dupont",
      pickup: "15 rue de la Paix, 75001 Paris",
      delivery: "42 avenue des Champs, 75008 Paris",
      date: "2025-05-30",
      time: "14:00",
      price: 25.50,
      status: "en_cours",
      description: "Colis fragile - Produits en verre"
    },
    {
      id: 2,
      title: "Livraison documents urgents",
      client: "Jean Martin",
      pickup: "123 bd Haussmann, 75009 Paris",
      delivery: "67 rue de Rivoli, 75001 Paris",
      date: "2025-05-31",
      time: "09:30",
      price: 15.00,
      status: "planifie",
      description: "Documents administratifs à remettre en main propre"
    },
    {
      id: 3,
      title: "Livraison alimentaire",
      client: "Restaurant Le Gourmet",
      pickup: "89 rue Saint-Antoine, 75004 Paris",
      delivery: "156 bd Voltaire, 75011 Paris",
      date: "2025-05-29",
      time: "12:30",
      price: 18.75,
      status: "termine",
      description: "Commande restaurant - Maintenir au chaud"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge bg="warning">En cours</Badge>;
      case 'planifie':
        return <Badge bg="info">Planifié</Badge>;
      case 'termine':
        return <Badge bg="success">Terminé</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_cours':
        return 'bi-clock-fill';
      case 'planifie':
        return 'bi-calendar-check';
      case 'termine':
        return 'bi-check-circle-fill';
      default:
        return 'bi-circle';
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-box-seam me-2"></i>
          Mes missions
        </h1>
        <Button variant="primary">
          <i className="bi bi-plus-circle me-2"></i>
          Rechercher nouvelles missions
        </Button>
      </div>

      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Vous avez <strong>2 missions actives</strong> et <strong>1 mission terminée</strong> ce mois.
      </Alert>

      <Row>
        {missions.map(mission => (
          <Col lg={6} className="mb-4" key={mission.id}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className={`bi ${getStatusIcon(mission.status)} me-2`}></i>
                  {mission.title}
                </h6>
                {getStatusBadge(mission.status)}
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>
                    <i className="bi bi-person me-1"></i>
                    Client :
                  </strong> {mission.client}
                </div>
                
                <div className="mb-3">
                  <div className="mb-2">
                    <i className="bi bi-geo-alt text-success me-1"></i>
                    <strong>Retrait :</strong> {mission.pickup}
                  </div>
                  <div>
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                    <strong>Livraison :</strong> {mission.delivery}
                  </div>
                </div>

                <div className="mb-3">
                  <i className="bi bi-calendar3 me-1"></i>
                  <strong>Date :</strong> {new Date(mission.date).toLocaleDateString('fr-FR')} à {mission.time}
                </div>

                <div className="mb-3">
                  <i className="bi bi-info-circle me-1"></i>
                  <strong>Description :</strong> {mission.description}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-success fw-bold">
                    <i className="bi bi-currency-euro me-1"></i>
                    {mission.price.toFixed(2)} €
                  </div>
                  <div>
                    {mission.status === 'planifie' && (
                      <Button variant="success" size="sm">
                        <i className="bi bi-play-fill me-1"></i>
                        Commencer
                      </Button>
                    )}
                    {mission.status === 'en_cours' && (
                      <Button variant="warning" size="sm">
                        <i className="bi bi-check-circle me-1"></i>
                        Terminer
                      </Button>
                    )}
                    {mission.status === 'termine' && (
                      <Button variant="outline-secondary" size="sm">
                        <i className="bi bi-eye me-1"></i>
                        Détails
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {missions.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <h3 className="mt-3">Aucune mission</h3>
          <p className="text-muted">Vous n'avez pas encore de missions assignées.</p>
          <Button variant="primary">
            <i className="bi bi-search me-2"></i>
            Rechercher des missions
          </Button>
        </div>
      )}
    </Container>
  );
};

export default LivreurMissions;
