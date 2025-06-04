import { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Accueil() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLivreurs: 0,
    totalAnnonces: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const [usersResponse, livreursResponse, annoncesResponse] = await Promise.all([
          fetch('http://localhost:8080/api/utilisateurs/count'),
          fetch('http://localhost:8080/api/livreurs/count'),
          fetch('http://localhost:8080/api/annonces/count')
        ]);

        if (!usersResponse.ok || !livreursResponse.ok || !annoncesResponse.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const users = await usersResponse.json();
        const livreurs = await livreursResponse.json();
        const annonces = await annoncesResponse.json();

        setStats({
          totalUsers: users,
          totalLivreurs: livreurs,
          totalAnnonces: annonces
        });
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardItems = [
    {
      icon: "people-fill",
      title: "Utilisateurs",
      description: "Gérer tous les utilisateurs",
      count: stats.totalUsers,
      linkTo: "/utilisateurs",
      color: "primary"
    },
    {
      icon: "megaphone-fill",
      title: "Annonces",
      description: "Gérer les annonces",
      count: stats.totalAnnonces,
      linkTo: "/annonces",
      color: "info"
    },
    {
      icon: "file-earmark-text",
      title: "Contrats",
      description: "Gérer les contrats",
      linkTo: "/contrats",
      color: "dark"
    },
    {
      icon: "receipt",
      title: "Factures",
      description: "Gérer la facturation",
      linkTo: "/factures",
      color: "danger"
    },
    {
      icon: "box-seam",
      title: "Box",
      description: "Gérer les box de stockage",
      linkTo: "/box",
      color: "primary"
    },
    {
      icon: "send",
      title: "Livraisons",
      description: "Gérer les livraisons",
      linkTo: "/livraisons",
      color: "success"
    }
  ];

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-2">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Tableau de bord EcoDeli</h1>
        <p className="lead text-muted">
          Interface d'administration pour la gestion de la plateforme EcoDeli
        </p>
        <hr className="my-4" />
      </div>
      
      <Row className="g-4">
        {dashboardItems.map((item, index) => (
          <Col md={4} key={index}>
            <Card className="h-100 shadow-sm border-0 dashboard-card">
              <Card.Body className="d-flex flex-column text-center p-4">
                <div className={`icon-wrapper bg-${item.color} bg-opacity-10 rounded-circle p-3 mx-auto mb-3`}>
                  <i className={`bi bi-${item.icon} fs-1 text-${item.color}`}></i>
                </div>
                <Card.Title className="mb-3 fw-bold">{item.title}</Card.Title>
                <div className="counter-box my-3">
                  <span className={`fs-1 fw-bold text-${item.color}`}>{item.count}</span>
                </div>
                <Card.Text className="text-muted mb-4">
                  {item.description}
                </Card.Text>
                <div className="mt-auto">
                  <Link 
                    to={item.linkTo} 
                    className={`btn btn-${item.color}`}
                  >
                    Accéder <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="mb-4">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                À propos d'EcoDeli
              </h3>
              <p>
                EcoDeli est une solution de crowdshipping qui met en relation les particuliers pour assurer des livraisons.
                Cette plateforme permet de réduire l'impact environnemental des livraisons tout en favorisant le pouvoir d'achat
                et en luttant contre l'isolement.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <div className="feature-badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                  <i className="bi bi-check-circle me-2"></i>Livraison écologique
                </div>
                <div className="feature-badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                  <i className="bi bi-people me-2"></i>Communauté solidaire
                </div>
                <div className="feature-badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                  <i className="bi bi-shield-check me-2"></i>Service sécurisé
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Accueil;
