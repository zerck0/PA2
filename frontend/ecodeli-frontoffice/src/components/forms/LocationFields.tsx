import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { CreateAnnonceDTO } from '../../types/annonce';

interface LocationFieldsProps {
  formData: CreateAnnonceDTO;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  disabled?: boolean;
}

/**
 * Composant pour les champs de localisation d'une annonce
 * Regroupe : villes et adresses de départ et d'arrivée
 */
const LocationFields: React.FC<LocationFieldsProps> = ({ 
  formData, 
  onChange, 
  disabled = false 
}) => {
  
  return (
    <>
      <h5 className="mb-3">
        <i className="bi bi-geo-alt me-2 text-primary"></i>
        Localisation
      </h5>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-pin-map me-2"></i>
              Ville de départ *
            </Form.Label>
            <Form.Control
              type="text"
              name="villeDepart"
              value={formData.villeDepart}
              onChange={onChange}
              placeholder="Ex: Paris"
              required
              disabled={disabled}
            />
            <Form.Control.Feedback type="invalid">
              Veuillez entrer la ville de départ.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-pin-map-fill me-2"></i>
              Ville d'arrivée *
            </Form.Label>
            <Form.Control
              type="text"
              name="villeArrivee"
              value={formData.villeArrivee}
              onChange={onChange}
              placeholder="Ex: Lyon"
              required
              disabled={disabled}
            />
            <Form.Control.Feedback type="invalid">
              Veuillez entrer la ville d'arrivée.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-house me-2"></i>
              Adresse de départ *
            </Form.Label>
            <Form.Control
              type="text"
              name="adresseDepart"
              value={formData.adresseDepart}
              onChange={onChange}
              placeholder="Adresse complète de départ"
              required
              disabled={disabled}
            />
            <Form.Text className="text-muted">
              Numéro, rue, code postal
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Veuillez entrer l'adresse de départ.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-house-fill me-2"></i>
              Adresse d'arrivée *
            </Form.Label>
            <Form.Control
              type="text"
              name="adresseArrivee"
              value={formData.adresseArrivee}
              onChange={onChange}
              placeholder="Adresse complète d'arrivée"
              required
              disabled={disabled}
            />
            <Form.Text className="text-muted">
              Numéro, rue, code postal
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Veuillez entrer l'adresse d'arrivée.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default LocationFields;
