import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { CreateAnnonceDTO } from '../../types/annonce';

interface DateFieldsProps {
  formData: CreateAnnonceDTO;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  disabled?: boolean;
}

/**
 * Composant pour les champs de dates d'une annonce
 * Regroupe : date limite et date préférée
 */
const DateFields: React.FC<DateFieldsProps> = ({ 
  formData, 
  onChange, 
  disabled = false 
}) => {
  
  return (
    <>
      <h5 className="mb-3">
        <i className="bi bi-calendar-event me-2 text-info"></i>
        Planning
      </h5>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-calendar-x me-2"></i>
              Date limite d'acceptation
            </Form.Label>
            <Form.Control
              type="datetime-local"
              name="dateLimite"
              value={formData.dateLimite}
              onChange={onChange}
              disabled={disabled}
            />
            <Form.Text className="text-muted">
              Date limite pour qu'un prestataire accepte votre annonce
            </Form.Text>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-calendar-check me-2"></i>
              Date préférée de réalisation
            </Form.Label>
            <Form.Control
              type="datetime-local"
              name="datePreferee"
              value={formData.datePreferee}
              onChange={onChange}
              disabled={disabled}
            />
            <Form.Text className="text-muted">
              Quand souhaitez-vous que le service soit réalisé ?
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Validation des dates */}
      {formData.dateLimite && formData.datePreferee && (
        <div className="mb-3">
          {new Date(formData.dateLimite) > new Date(formData.datePreferee) ? (
            <div className="alert alert-warning py-2">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <small>
                La date limite d'acceptation est après la date préférée de réalisation. 
                Vérifiez vos dates.
              </small>
            </div>
          ) : new Date(formData.dateLimite) < new Date() ? (
            <div className="alert alert-danger py-2">
              <i className="bi bi-x-circle me-2"></i>
              <small>
                La date limite d'acceptation est dans le passé.
              </small>
            </div>
          ) : (
            <div className="alert alert-success py-2">
              <i className="bi bi-check-circle me-2"></i>
              <small>
                Planning cohérent : acceptation avant le {new Date(formData.dateLimite).toLocaleDateString('fr-FR')} 
                pour une réalisation le {new Date(formData.datePreferee).toLocaleDateString('fr-FR')}
              </small>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DateFields;
