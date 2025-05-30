import React from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { AuthResponse } from '../../services/authService';
import { Annonce } from '../../types/annonce';

interface DashboardProfileProps {
  currentUser: AuthResponse;
  annonces: Annonce[];
}

const DashboardProfile: React.FC<DashboardProfileProps> = ({ currentUser, annonces }) => {
  const renderRoleSpecificInfo = () => {
    switch (currentUser?.user?.role) {
      case 'LIVREUR':
        return (
          <div className="bg-light rounded p-4 mb-4">
            <h5 className="mb-3">
              <i className="bi bi-truck me-2 text-warning"></i>
              Informations livreur
            </h5>
            <Row>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Véhicule</label>
                <div className="fw-bold">À renseigner</div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Permis vérifié</label>
                <div>
                  <Badge bg="warning">En attente</Badge>
                </div>
              </Col>
            </Row>
          </div>
        );
      
      case 'COMMERCANT':
        return (
          <div className="bg-light rounded p-4 mb-4">
            <h5 className="mb-3">
              <i className="bi bi-shop me-2 text-info"></i>
              Informations commerçant
            </h5>
            <Row>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">SIRET</label>
                <div className="fw-bold">À renseigner</div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Statut contrat</label>
                <div>
                  <Badge bg="warning">En attente</Badge>
                </div>
              </Col>
            </Row>
          </div>
        );
      
      case 'PRESTATAIRE':
        return (
          <div className="bg-light rounded p-4 mb-4">
            <h5 className="mb-3">
              <i className="bi bi-tools me-2 text-danger"></i>
              Informations prestataire
            </h5>
            <Row>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Type de service</label>
                <div className="fw-bold">À renseigner</div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Tarif horaire</label>
                <div className="fw-bold">À renseigner</div>
              </Col>
            </Row>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Mon profil</h4>
        <Button variant="outline-primary">
          <i className="bi bi-pencil me-2"></i>
          Modifier mes informations
        </Button>
      </div>
      
      <Row>
        <Col lg={8}>
          <div className="bg-light rounded p-4 mb-4">
            <h5 className="mb-3">
              <i className="bi bi-person-circle me-2 text-primary"></i>
              Informations personnelles
            </h5>
            <Row>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Prénom</label>
                <div className="fw-bold">{currentUser?.user?.prenom || 'Non renseigné'}</div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Nom</label>
                <div className="fw-bold">{currentUser?.user?.nom || 'Non renseigné'}</div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Adresse email</label>
                <div className="fw-bold">{currentUser?.user?.email}</div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Rôle</label>
                <div>
                  <Badge bg="info" className="fs-6">{currentUser?.user?.role}</Badge>
                </div>
              </Col>
            </Row>
          </div>

          <div className="bg-light rounded p-4 mb-4">
            <h5 className="mb-3">
              <i className="bi bi-shield-check me-2 text-success"></i>
              Informations de compte
            </h5>
            <Row>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">ID utilisateur</label>
                <div className="fw-bold">#{currentUser?.user?.id}</div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Statut du compte</label>
                <div>
                  <Badge bg="success" className="fs-6">
                    <i className="bi bi-check-circle me-1"></i>
                    Actif
                  </Badge>
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Membre depuis</label>
                <div className="fw-bold">
                  {new Date().toLocaleDateString('fr-FR')}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <label className="form-label text-muted small">Dernière connexion</label>
                <div className="fw-bold">
                  {new Date().toLocaleDateString('fr-FR')}
                </div>
              </Col>
            </Row>
          </div>

          {renderRoleSpecificInfo()}
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-person-circle display-1 text-muted"></i>
              </div>
              <h6 className="mb-2">{currentUser?.user?.prenom} {currentUser?.user?.nom}</h6>
              <Badge bg="primary" className="mb-3">{currentUser?.user?.role}</Badge>
              
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  <i className="bi bi-camera me-2"></i>
                  Changer la photo
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <i className="bi bi-key me-2"></i>
                  Changer le mot de passe
                </Button>
                <Button variant="outline-danger" size="sm">
                  <i className="bi bi-trash me-2"></i>
                  Supprimer le compte
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mt-3">
            <Card.Body>
              <h6 className="mb-3">Statistiques</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Annonces créées</span>
                <span className="fw-bold">{annonces.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Annonces actives</span>
                <span className="fw-bold">{annonces.filter(a => a.statut === 'ACTIVE').length}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Note moyenne</span>
                <span className="fw-bold">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  4.5/5
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardProfile;
