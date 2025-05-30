import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { CreateAnnonceDTO } from '../../types/annonce';

interface ColisFieldsProps {
  formData: CreateAnnonceDTO;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  show: boolean;
}

/**
 * Composant pour les champs spécifiques aux colis
 * Affiché uniquement pour les annonces de type "LIVRAISON_COLIS"
 */
const ColisFields: React.FC<ColisFieldsProps> = ({ 
  formData, 
  onChange, 
  disabled = false,
  show 
}) => {
  
  if (!show) return null;
  
  return (
    <>
      <h5 className="mb-3">
        <i className="bi bi-box me-2 text-warning"></i>
        Informations sur le colis
      </h5>
      
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-tag me-2"></i>
              Type de colis
            </Form.Label>
            <Form.Control
              type="text"
              name="typeColis"
              value={formData.typeColis}
              onChange={onChange}
              placeholder="Ex: Électronique, Document, Vêtement..."
              disabled={disabled}
            />
            <Form.Text className="text-muted">
              Quel type d'objet doit être livré ?
            </Form.Text>
          </Form.Group>
        </Col>
        
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-speedometer me-2"></i>
              Poids (kg)
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type="number"
                step="0.1"
                min="0"
                name="poids"
                value={formData.poids}
                onChange={onChange}
                placeholder="0.0"
                disabled={disabled}
              />
              <span className="input-group-text">kg</span>
            </div>
            <Form.Text className="text-muted">
              Poids approximatif du colis
            </Form.Text>
          </Form.Group>
        </Col>
        
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-rulers me-2"></i>
              Dimensions
            </Form.Label>
            <Form.Control
              type="text"
              name="dimensions"
              value={formData.dimensions}
              onChange={onChange}
              placeholder="Ex: 30x20x15 cm"
              disabled={disabled}
            />
            <Form.Text className="text-muted">
              Longueur x Largeur x Hauteur
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
      
      {/* Options spéciales */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="fragile"
              checked={formData.fragile}
              onChange={onChange}
              label={
                <span>
                  <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                  Colis fragile - Manipulation délicate requise
                </span>
              }
              disabled={disabled}
            />
            <Form.Text className="text-muted">
              Cochez si le colis nécessite une attention particulière
            </Form.Text>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          {/* Indicateur visuel pour les colis lourds */}
          {(formData.poids || 0) > 20 && (
            <div className="alert alert-info py-2">
              <i className="bi bi-info-circle me-2"></i>
              <small>
                Colis lourd ({formData.poids}kg) - Vérifiez que le livreur peut le porter
              </small>
            </div>
          )}
          
          {/* Indicateur pour les colis fragiles */}
          {formData.fragile && (
            <div className="alert alert-warning py-2">
              <i className="bi bi-shield-exclamation me-2"></i>
              <small>
                Colis fragile - Le prix pourrait être majoré pour la prudence requise
              </small>
            </div>
          )}
        </Col>
      </Row>
    </>
  );
};

export default ColisFields;
