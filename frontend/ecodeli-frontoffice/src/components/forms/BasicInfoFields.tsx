import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { CreateAnnonceDTO } from '../../types/annonce';

interface BasicInfoFieldsProps {
  formData: CreateAnnonceDTO;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  disabled?: boolean;
}

/**
 * Composant pour les champs d'informations de base d'une annonce
 * Regroupe : titre, type de service et description
 */
const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  formData, 
  onChange, 
  disabled = false 
}) => {
  
  return (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-card-text me-2"></i>
              Titre de l'annonce *
            </Form.Label>
            <Form.Control
              type="text"
              name="titre"
              value={formData.titre}
              onChange={onChange}
              placeholder="Ex: Livraison de colis urgent"
              required
              disabled={disabled}
            />
            <Form.Control.Feedback type="invalid">
              Veuillez entrer un titre descriptif.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-tags me-2"></i>
              Type de service *
            </Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={onChange}
              required
              disabled={disabled}
            >
              <option value="">Sélectionner un type</option>
              <option value="LIVRAISON_COLIS">
                📦 Livraison de colis
              </option>
              <option value="SERVICE_PERSONNE">
                🏠 Service à la personne
              </option>
              <option value="TRANSPORT_PERSONNE">
                🚗 Transport de personne
              </option>
              <option value="COURSES">
                🛒 Courses
              </option>
              <option value="ACHAT_ETRANGER">
                🌍 Achat à l'étranger
              </option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Veuillez sélectionner un type de service.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label>
          <i className="bi bi-chat-text me-2"></i>
          Description détaillée *
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Décrivez votre demande en détail : ce qui doit être fait, contraintes particulières, instructions spéciales..."
          required
          disabled={disabled}
        />
        <Form.Text className="text-muted">
          Une description claire aidera les prestataires à mieux comprendre votre besoin.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          Veuillez entrer une description détaillée.
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

export default BasicInfoFields;
