import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FormData, ValidationErrors } from '../../utils/formValidation';

interface RoleSpecificFieldsProps {
  formData: FormData;
  errors: ValidationErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const RoleSpecificFields: React.FC<RoleSpecificFieldsProps> = ({
  formData,
  errors,
  onChange
}) => {
  switch (formData.role) {
    case 'LIVREUR':
      return (
        <div className="mb-4 p-3 bg-light rounded">
          <h6 className="mb-3">Informations livreur</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type de véhicule</Form.Label>
                <Form.Control
                  name="vehicule"
                  value={formData.vehicule || ''}
                  onChange={onChange}
                  required
                  isInvalid={!!errors.vehicule}
                >
                  <option value="">Sélectionnez votre véhicule</option>
                  <option value="VELO">Vélo</option>
                  <option value="SCOOTER">Scooter</option>
                  <option value="VOITURE">Voiture</option>
                  <option value="CAMIONNETTE">Camionnette</option>
                </Form.Control>
                {errors.vehicule && <div className="invalid-feedback d-block">{errors.vehicule}</div>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="permisVerif"
                  label="Je certifie avoir un permis de conduire valide"
                  checked={formData.permisVerif || false}
                  onChange={onChange}
                  className="mt-4"
                />
                {errors.permisVerif && <div className="invalid-feedback d-block">{errors.permisVerif}</div>}
              </Form.Group>
            </Col>
          </Row>
        </div>
      );

    case 'COMMERCANT':
      return (
        <div className="mb-4 p-3 bg-light rounded">
          <h6 className="mb-3">Informations commerçant</h6>
          <Form.Group className="mb-3">
            <Form.Label>Numéro SIRET</Form.Label>
            <Form.Control
              name="siret"
              value={formData.siret || ''}
              onChange={onChange}
              placeholder="14 chiffres"
              maxLength={14}
              required
            />
            <Form.Text className="text-muted">
              Votre numéro SIRET à 14 chiffres
            </Form.Text>
            {errors.siret && <div className="invalid-feedback d-block">{errors.siret}</div>}
          </Form.Group>
        </div>
      );

    case 'PRESTATAIRE':
      return (
        <div className="mb-4 p-3 bg-light rounded">
          <h6 className="mb-3">Informations prestataire</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type de service</Form.Label>
                <Form.Select
                  name="typeService"
                  value={formData.typeService || ''}
                  onChange={onChange}
                  required
                >
                  <option value="">Sélectionnez votre service</option>
                  <option value="MENAGE">Ménage</option>
                  <option value="JARDINAGE">Jardinage</option>
                  <option value="BRICOLAGE">Bricolage</option>
                  <option value="GARDE_ANIMAUX">Garde d'animaux</option>
                  <option value="COURSES">Courses</option>
                  <option value="AUTRE">Autre</option>
                </Form.Select>
                {errors.typeService && <div className="invalid-feedback d-block">{errors.typeService}</div>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tarif horaire (€)</Form.Label>
                <Form.Control
                  type="number"
                  name="tarifHoraire"
                  value={formData.tarifHoraire || ''}
                  onChange={onChange}
                  min="0"
                  step="0.5"
                  placeholder="Ex: 15.50"
                  required
                />
                {errors.tarifHoraire && <div className="invalid-feedback d-block">{errors.tarifHoraire}</div>}
              </Form.Group>
            </Col>
          </Row>
        </div>
      );

    default:
      return null;
  }
};

export default RoleSpecificFields;