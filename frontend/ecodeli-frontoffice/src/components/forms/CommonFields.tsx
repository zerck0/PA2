import React from 'react';
import { Row, Col, Form, Spinner } from 'react-bootstrap';
import { FormData, ValidationErrors } from '../../utils/formValidation';

interface CommonFieldsProps {
  formData: FormData;
  errors: ValidationErrors;
  emailAvailable: boolean | null;
  checkingEmail: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const CommonFields: React.FC<CommonFieldsProps> = ({
  formData,
  errors,
  emailAvailable,
  checkingEmail,
  onChange
}) => {
  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nom *</Form.Label>
            <Form.Control
              type="text"
              name="nom"
              value={formData.nom}
              onChange={onChange}
              placeholder="Votre nom"
              required
              isInvalid={!!errors.nom}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nom}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Prénom *</Form.Label>
            <Form.Control
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={onChange}
              placeholder="Votre prénom"
              required
              isInvalid={!!errors.prenom}
            />
            <Form.Control.Feedback type="invalid">
              {errors.prenom}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Email *</Form.Label>
        <div className="position-relative">
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="votre@email.com"
            required
            isInvalid={!!errors.email || emailAvailable === false}
            isValid={emailAvailable === true && !errors.email}
          />
          {checkingEmail && (
            <div className="position-absolute top-50 end-0 translate-middle-y me-3">
              <Spinner animation="border" size="sm" />
            </div>
          )}
          <Form.Control.Feedback type="invalid">
            {errors.email || (emailAvailable === false && "Cette adresse email est déjà utilisée")}
          </Form.Control.Feedback>
          <Form.Control.Feedback type="valid">
            Email disponible
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Téléphone *</Form.Label>
        <Form.Control
          type="tel"
          name="telephone"
          value={formData.telephone}
          onChange={onChange}
          placeholder="06 XX XX XX XX"
          required
          isInvalid={!!errors.telephone}
        />
        <Form.Control.Feedback type="invalid">
          {errors.telephone}
        </Form.Control.Feedback>
      </Form.Group>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Mot de passe *</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Minimum 6 caractères"
              required
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Confirmer le mot de passe *</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={onChange}
              placeholder="Répétez votre mot de passe"
              required
              isInvalid={!!errors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default CommonFields;