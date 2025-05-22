import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form } from 'react-bootstrap';

interface Annonce {
  id: number;
  titre: string;
  description: string;
  type: string;
  villeDepart: string;
  villeArrivee: string;
  dateCreation: string;
  dateLivraison: string;
  prix: number;
  statut: string;
  distance: number;
}

const LivreurAnnonces: React.FC = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState('');

  useEffect(() => {
    // Simuler une requête API pour charger les annonces disponibles pour un livreur
    setTimeout(() => {
      const mockAnnonces: Annonce[] = [
        {
          id: 1,
          titre: "Livraison de colis urgent",
          description: "Petit colis à livrer, dimensions 20x30x10cm, poids 2kg",
          type: "LIVRAISON",
          villeDepart: "Paris",
          villeArrivee: "Lyon",
          dateCreation: "2023-07-15",
          dateLivraison: "2023-07-20",
          prix: 40.50,
          statut: "DISPONIBLE",
          distance: 465
        },
        {
          id: 2,
          titre: "Transport de commode antique",
          description: "Commode en bois à manipuler avec précaution",
          type: "TRANSPORT",
          villeDepart: "Marseille",
          villeArrivee: "Nice",
          dateCreation: "2023-07-14",
          dateLivraison: "2023-07-25",
          prix: 120.00,
          statut: "EN_LIVRAISON",
          distance: 200
        },
        {
          id: 3,
          titre: "Accompagnement pour courses",
          description: "Aide pour faire les courses pour une personne âgée",
          type: "SERVICE",
          villeDepart: "Lille",
          villeArrivee: "Lille",
          dateCreation: "2023-07-10",
          dateLivraison: "2023-07-18",
          prix: 30.00,
          statut: "TERMINEE",
          distance: 0
        },
        {
          id: 4,
          titre: "Transport d'ordinateur",
          description: "Ordinateur portable à remettre en main propre",
          type: "LIVRAISON",
          villeDepart: "Lyon",
          villeArrivee: "Grenoble",
          dateCreation: "2023-07-16",
          dateLivraison: "2023-07-22",
          prix: 25.00,
          statut: "DISPONIBLE",
          distance: 110
        }
      ];
      
      setAnnonces(mockAnnonces);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAnnonces = annonces.filter(annonce => 
    filtreStatut === '' || annonce.statut === filtreStatut
  );

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'DISPONIBLE': return <Badge bg="success">Disponible</Badge>;
      case 'EN_LIVRAISON': return <Badge bg="info">En livraison</Badge>;
      case 'TERMINEE': return <Badge bg="secondary">Terminée</Badge>;
      default: return <Badge bg="secondary">{statut}</Badge>;
    }
  };

  const handleAccepter = (id: number) => {
    // Simuler l'acceptation d'une annonce par le livreur
    setAnnonces(prev => 
      prev.map(annonce => 
        annonce.id === id ? { ...annonce, statut: 'EN_LIVRAISON' } : annonce
      )
    );
    alert(`Vous avez accepté l'annonce #${id}. Une notification a été envoyée au client.`);
  };

  const handleTerminer = (id: number) => {
    // Simuler la fin d'une livraison
    setAnnonces(prev => 
      prev.map(annonce => 
        annonce.id === id ? { ...annonce, statut: 'TERMINEE' } : annonce
      )
    );
    alert(`Livraison #${id} terminée avec succès. Merci !`);
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Mes missions de livraison</h2>

      <div className="mb-4">
        <Row>
          <Col md={6}>
            <Form.Select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="mb-3"
            >
              <option value="">Tous les statuts</option>
              <option value="DISPONIBLE">Disponibles</option>
              <option value="EN_LIVRAISON">En cours</option>
              <option value="TERMINEE">Terminées</option>
            </Form.Select>
          </Col>
        </Row>
      </div>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des annonces...</p>
        </div>
      ) : filteredAnnonces.length === 0 ? (
        <div className="text-center py-5">
          <p className="mb-0">Aucune mission ne correspond aux critères.</p>
        </div>
      ) : (
        <Row>
          {filteredAnnonces.map(annonce => (
            <Col md={6} lg={4} className="mb-4" key={annonce.id}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <div>{getStatutBadge(annonce.statut)}</div>
                    <div><Badge bg="dark">{annonce.type}</Badge></div>
                  </div>
                  <Card.Title className="mb-2">{annonce.titre}</Card.Title>
                  <Card.Text className="mb-3">{annonce.description}</Card.Text>
                  
                  <div className="mb-2">
                    <small className="text-muted d-block">
                      <i className="bi bi-geo-alt me-1"></i>
                      De {annonce.villeDepart} à {annonce.villeArrivee}
                      {annonce.distance > 0 && ` • ${annonce.distance} km`}
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted d-block">
                      <i className="bi bi-calendar me-1"></i>
                      Livraison prévue le {new Date(annonce.dateLivraison).toLocaleDateString('fr-FR')}
                    </small>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-5 fw-bold text-primary">{annonce.prix.toFixed(2)} €</span>
                    {annonce.statut === 'DISPONIBLE' && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => handleAccepter(annonce.id)}
                      >
                        Accepter
                      </Button>
                    )}
                    {annonce.statut === 'EN_LIVRAISON' && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleTerminer(annonce.id)}
                      >
                        Terminer
                      </Button>
                    )}
                    {annonce.statut === 'TERMINEE' && (
                      <span className="text-muted small">Terminée le {new Date().toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default LivreurAnnonces;