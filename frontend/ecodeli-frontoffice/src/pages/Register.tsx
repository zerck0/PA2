import React from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import CommonFields from '../components/forms/CommonFields';
import RoleSpecificFields from '../components/forms/RoleSpecificFields';
import logoEco from '../assets/logoEco.png';

/**
 * Page d'inscription utilisateur
 * Formulaire d'inscription avec champs spécifiques selon le rôle choisi
 */
const Register = () => {
  // Hooks pour l'authentification et la gestion du formulaire
  const { loading, error, validated, handleRegister, validateForm, setError } = useAuth();
  const {
    formData,
    errors,
    emailAvailable,
    checkingEmail,
    handleChange,
    validate
  } = useRegistrationForm();

  /**
   * Gère la soumission du formulaire d'inscription
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as HTMLFormElement;
    
    // Validation du formulaire (HTML5 + validation personnalisée)
    const isFormValid = validateForm(form);
    const isDataValid = validate();
    
    if (!isFormValid || !isDataValid) {
      e.stopPropagation();
      return;
    }
    
    // Vérifier que l'email est disponible
    if (emailAvailable === false) {
      setError('Cette adresse email est déjà utilisée. Veuillez en choisir une autre.');
      return;
    }
    
    // Inscription de l'utilisateur
    const { confirmPassword, ...userData } = formData;
    await handleRegister(userData);
  };

  /**
   * Affiche un message d'erreur si présent
   */
  const renderError = () => {
    if (!error) return null;
    
    return (
      <Alert variant="danger" className="mb-4">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </Alert>
    );
  };

  /**
   * Rendu du sélecteur de rôle
   */
  const renderRoleSelector = () => (
    <Form.Group className="mb-4">
      <Form.Label className="fw-bold">
        <i className="bi bi-person-badge me-2"></i>
        Je souhaite m'inscrire en tant que
      </Form.Label>
      <Form.Select
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
        disabled={loading}
      >
        <option value="CLIENT">
          Client - Je souhaite utiliser les services
        </option>
        <option value="LIVREUR">
          Livreur - Je propose des services de livraison
        </option>
        <option value="COMMERCANT">
          Commerçant - Je vends des produits
        </option>
        <option value="PRESTATAIRE">
          Prestataire - Je propose des services
        </option>
      </Form.Select>
      <Form.Text className="text-muted">
        Choisissez le rôle qui correspond le mieux à votre utilisation d'EcoDeli
      </Form.Text>
    </Form.Group>
  );

  /**
   * Rendu des conditions d'utilisation
   */
  const renderTermsAcceptance = () => (
    <Form.Group className="mb-4">
      <Form.Check
        required
        disabled={loading}
        label={
          <span>
            J'accepte les{' '}
            <Link to="/terms" target="_blank" className="text-decoration-none">
              conditions d'utilisation
            </Link>
            {' '}et la{' '}
            <Link to="/privacy" target="_blank" className="text-decoration-none">
              politique de confidentialité
            </Link>
          </span>
        }
        feedback="Vous devez accepter avant de vous inscrire."
        feedbackType="invalid"
      />
    </Form.Group>
  );

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {/* Titre de la page avec logo */}
              <div className="text-center mb-4">
                <img 
                  src={logoEco} 
                  alt="EcoDeli" 
                  style={{ maxHeight: '60px', maxWidth: '150px' }}
                  className="mb-3"
                />
                <h2>Inscription</h2>
                <p className="text-muted">
                  Rejoignez la communauté EcoDeli et découvrez nos services
                </p>
              </div>
              
              {/* Affichage des erreurs */}
              {renderError()}
              
              {/* Formulaire d'inscription */}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                {/* Sélecteur de rôle */}
                {renderRoleSelector()}
                
                {/* Champs communs (nom, prénom, email, mot de passe) */}
                <CommonFields
                  formData={formData}
                  errors={errors}
                  emailAvailable={emailAvailable}
                  checkingEmail={checkingEmail}
                  onChange={handleChange}
                />
                
                {/* Champs spécifiques au rôle */}
                <RoleSpecificFields
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
                
                {/* Acceptation des conditions */}
                {renderTermsAcceptance()}
                
                {/* Bouton d'inscription */}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      S'inscrire
                    </>
                  )}
                </Button>
              </Form>
              
              {/* Lien vers la connexion */}
              <div className="text-center mt-4">
                <span className="text-muted">Déjà inscrit ? </span>
                <Link to="/login" className="text-decoration-none fw-bold">
                  Se connecter
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
