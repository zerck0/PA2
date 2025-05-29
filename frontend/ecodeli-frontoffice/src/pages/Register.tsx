import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import CommonFields from '../components/forms/CommonFields';
import RoleSpecificFields from '../components/forms/RoleSpecificFields';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  const {
    formData,
    errors,
    emailAvailable,
    checkingEmail,
    handleChange,
    validate
  } = useRegistrationForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as HTMLFormElement;
    
    // Validation côté client avec notre fonction personnalisée
    const isValid = validate();
    
    // Validation HTML5 de Bootstrap
    if (form.checkValidity() === false || !isValid) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Vérifier que l'email est disponible
    if (emailAvailable === false) {
      setError('Cette adresse email est déjà utilisée. Veuillez en choisir une autre.');
      return;
    }
    
    setError('');
    
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Cette adresse email est déjà utilisée. Veuillez en choisir une autre.');
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
      }
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Inscription</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Je souhaite m'inscrire en tant que</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="CLIENT">Client</option>
                    <option value="LIVREUR">Livreur</option>
                    <option value="COMMERCANT">Commerçant</option>
                    <option value="PRESTATAIRE">Prestataire</option>
                  </Form.Select>
                </Form.Group>
                
                <CommonFields
                  formData={formData}
                  errors={errors}
                  emailAvailable={emailAvailable}
                  checkingEmail={checkingEmail}
                  onChange={handleChange}
                />
                
                <RoleSpecificFields
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
                
                <Form.Group className="mb-4">
                  <Form.Check
                    required
                    label={
                      <span>
                        J'accepte les <Link to="/terms">conditions d'utilisation</Link> et la <Link to="/privacy">politique de confidentialité</Link>
                      </span>
                    }
                    feedback="Vous devez accepter avant de vous inscrire."
                    feedbackType="invalid"
                  />
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                Déjà inscrit ? <Link to="/login">Se connecter</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;