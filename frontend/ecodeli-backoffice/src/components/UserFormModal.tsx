import React from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { FormData } from '../types/common';

interface UserFormModalProps {
  show: boolean;
  onHide: () => void;
  formData: FormData;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isEdit?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  show,
  onHide,
  formData,
  onSubmit,
  onChange,
  isEdit
}) => {
  const renderSpecificFields = () => {
    switch (formData.role) {
      case 'LIVREUR':
        return (
          <div className="role-specific-fields p-3 bg-light rounded mb-3">
            <h6 className="mb-3">Informations spécifiques au livreur</h6>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Véhicule</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicule"
                    value={formData.vehicule || ''}
                    onChange={onChange}
                    placeholder="Type de véhicule"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mt-4">
                  <Form.Check
                    type="checkbox"
                    name="permisVerif"
                    label="Permis vérifié"
                    checked={formData.permisVerif || false}
                    onChange={onChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );
      case 'COMMERCANT':
        return (
          <div className="mb-3">
            <Form.Group>
              <Form.Label>SIRET</Form.Label>
              <Form.Control
                type="text"
                name="siret"
                value={formData.siret || ''}
                onChange={onChange}
              />
            </Form.Group>
          </div>
        );
      case 'PRESTATAIRE':
        return (
          <>
            <div className="mb-3">
              <Form.Group>
                <Form.Label>Type de service</Form.Label>
                <Form.Control
                  type="text"
                  name="typeService"
                  value={formData.typeService || ''}
                  onChange={onChange}
                />
              </Form.Group>
            </div>
            <div className="mb-3">
              <Form.Group>
                <Form.Label>Tarif horaire (€)</Form.Label>
                <Form.Control
                  type="number"
                  name="tarifHoraire"
                  value={formData.tarifHoraire || ''}
                  onChange={onChange}
                />
              </Form.Group>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-plus me-2"></i>
            {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Rôle</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={onChange}
                >
                  <option value="CLIENT">Client</option>
                  <option value="LIVREUR">Livreur</option>
                  <option value="COMMERCANT">Commerçant</option>
                  <option value="PRESTATAIRE">Prestataire</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={onChange}
                  required
                  placeholder="Nom"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={onChange}
                  placeholder="Prénom"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                  placeholder="email@exemple.com"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={onChange}
                  placeholder="06 XX XX XX XX"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  required
                  placeholder="Mot de passe"
                />
              </Form.Group>
            </Col>
          </Row>

          {renderSpecificFields()}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide}>
            Annuler
          </Button>
          <Button variant="success" type="submit">
            <i className="bi bi-check-lg me-2"></i>
            {isEdit ? "Modifier l'utilisateur" : "Créer l'utilisateur"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserFormModal;