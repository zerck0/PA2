import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';

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
}

const Annonces = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    // Simuler une requête API
    setTimeout(() => {
      // Exemples d'annonces
      const mockAnnonces: Annonce[] = [
        {
          id: 1,
          titre: "Livraison de petit colis",
          description: "Petit colis à livrer, dimensions 20x30x10cm, poids 2kg",
          type: "LIVRAISON",
          villeDepart: "Paris",
          villeArrivee: "Lyon",
          dateCreation: "2023-07-15",
          dateLivraison: "2023-07-20",
          prix: 15.50,
          statut: "EN_COURS"
        },
        {
          id: 2,
          titre: "Transport de meubles",
          description: "Table et chaises à transporter, besoin d'une camionnette",
          type: "TRANSPORT",
          villeDepart: "Marseille",
          villeArrivee: "Nice",
          dateCreation: "2023-07-14",
          dateLivraison: "2023-07-25",
          prix: 75.00,
          statut: "EN_ATTENTE"
        },
        {
          id: 3,
          titre: "Accompagnement à un rendez-vous médical",
          description: "Besoin d'accompagnement pour une personne âgée à un rendez-vous médical",
          type: "SERVICE",
          villeDepart: "Lille",
          villeArrivee: "Lille",
          dateCreation: "2023-07-10",
          dateLivraison: "2023-07-18",
          prix: 30.00,
          statut: "VALIDEE"
        }
      ];
      
      setAnnonces(mockAnnonces);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAnnonces = annonces.filter(annonce => {
    const matchesSearch = searchTerm === '' || 
      annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annonce.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annonce.villeDepart.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annonce.villeArrivee.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType === '' || annonce.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return <Badge bg="warning">En attente</Badge>;
      case 'VALIDEE': return <Badge bg="success">Validée</Badge>;
      case 'EN_COURS': return <Badge bg="info">En cours</Badge>;
      case 'TERMINEE': return <Badge bg="secondary">Terminée</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Annonces</h2>
      
      <Row className="mb-4">
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Rechercher une annonce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="LIVRAISON">Livraison</option>
            <option value="TRANSPORT">Transport</option>
            <option value="SERVICE">Service</option>
          </Form.Select>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des annonces...</p>
        </div>
      ) : (
        <>
          {filteredAnnonces.length === 0 ? (
            <div className="text-center py-5">
              <p>Aucune annonce ne correspond à vos critères.</p>
            </div>
          ) : (
            <Row>
              {filteredAnnonces.map(annonce => (
                <Col md={6} lg={4} className="mb-4" key={annonce.id}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <div>{getStatusBadge(annonce.statut)}</div>
                        <div><Badge bg="dark">{annonce.type}</Badge></div>
                      </div>
                      <Card.Title>{annonce.titre}</Card.Title>
                      <Card.Text>{annonce.description}</Card.Text>
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="bi bi-geo-alt me-1"></i>
                          De {annonce.villeDepart} à {annonce.villeArrivee}
                        </small>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          Livraison le {new Date(annonce.dateLivraison).toLocaleDateString('fr-FR')}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fs-5 fw-bold text-primary">{annonce.prix.toFixed(2)} €</span>
                        <Button variant="outline-primary" size="sm">
                          Voir détails
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default Annonces;