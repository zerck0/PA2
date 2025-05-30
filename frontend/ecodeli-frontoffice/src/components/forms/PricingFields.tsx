import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { CreateAnnonceDTO } from '../../types/annonce';

interface PricingFieldsProps {
  formData: CreateAnnonceDTO;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  disabled?: boolean;
}

/**
 * Composant pour les champs de tarification d'une annonce
 * Regroupe : prix proposé et prix négociable
 */
const PricingFields: React.FC<PricingFieldsProps> = ({ 
  formData, 
  onChange, 
  disabled = false 
}) => {
  
  return (
    <>
      <h5 className="mb-3">
        <i className="bi bi-currency-euro me-2 text-success"></i>
        Tarification
      </h5>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-tag me-2"></i>
              Prix proposé (€) *
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="prixPropose"
                value={formData.prixPropose}
                onChange={onChange}
                placeholder="0.00"
                required
                disabled={disabled}
              />
              <span className="input-group-text">€</span>
            </div>
            <Form.Text className="text-muted">
              Montant que vous proposez de payer pour ce service
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Veuillez entrer un prix valide.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-tag-fill me-2"></i>
              Prix négociable (€)
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="prixNegociable"
                value={formData.prixNegociable}
                onChange={onChange}
                placeholder="0.00"
                disabled={disabled}
              />
              <span className="input-group-text">€</span>
            </div>
            <Form.Text className="text-muted">
              Optionnel - prix maximum que vous accepteriez de payer
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Indicateur visuel pour aider l'utilisateur */}
      {formData.prixPropose > 0 && (formData.prixNegociable || 0) > 0 && (
        <div className="mb-3">
          {(formData.prixNegociable || 0) < formData.prixPropose ? (
            <div className="alert alert-warning py-2">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <small>
                Le prix négociable est inférieur au prix proposé. 
                Vérifiez vos montants.
              </small>
            </div>
          ) : (formData.prixNegociable || 0) > formData.prixPropose ? (
            <div className="alert alert-info py-2">
              <i className="bi bi-info-circle me-2"></i>
              <small>
                Fourchette de prix : {formData.prixPropose}€ - {formData.prixNegociable}€
              </small>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default PricingFields;
