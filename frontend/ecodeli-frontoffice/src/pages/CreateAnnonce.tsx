import React from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useCreateAnnonce } from '../hooks/useCreateAnnonce';
import { 
  BasicInfoFields, 
  LocationFields, 
  PricingFields, 
  DateFields, 
  ColisFields 
} from '../components/forms';

/**
 * Page de création d'annonce - Version refactorisée
 * Utilise des composants modulaires et un hook personnalisé
 */
const CreateAnnonce = () => {
  // Utilisation de notre hook personnalisé pour toute la logique
  const {
    formData,
    loading,
    error,
    success,
    validated,
    currentUser,
    isLivraisonType,
    handleInputChange,
    handleSubmit,
    handleCancel,
    clearError
  } = useCreateAnnonce();

  /**
   * Affiche l'état de non-connexion
   */
  const renderNotConnected = () => (
    <Container className="py-5 page-content">
      <Alert variant="warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Vous devez être connecté pour créer une annonce.
      </Alert>
    </Container>
  );

  /**
   * Affiche l'état de succès
   */
  const renderSuccess = () => (
    <Container className="py-5 page-content">
      <Alert variant="success">
        <i className="bi bi-check-circle me-2"></i>
        Votre annonce a été créée avec succès ! Redirection en cours...
      </Alert>
    </Container>
  );

  /**
   * Affiche le formulaire principal
   */
  const renderForm = () => (
    <Container className="py-5 page-content">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <Card className="border-0 shadow-sm">
            {/* En-tête */}
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Créer une nouvelle annonce
              </h3>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Message d'erreur */}
              {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={clearError}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Formulaire principal */}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                
                {/* Section 1: Informations de base */}
                <BasicInfoFields 
                  formData={formData}
                  onChange={handleInputChange}
                  disabled={loading}
                />

                <hr className="my-4" />

                {/* Section 2: Localisation */}
                <LocationFields 
                  formData={formData}
                  onChange={handleInputChange}
                  disabled={loading}
                />

                <hr className="my-4" />

                {/* Section 3: Tarification */}
                <PricingFields 
                  formData={formData}
                  onChange={handleInputChange}
                  disabled={loading}
                />

                <hr className="my-4" />

                {/* Section 4: Planning */}
                <DateFields 
                  formData={formData}
                  onChange={handleInputChange}
                  disabled={loading}
                />

                {/* Section 5: Informations colis (conditionnel) */}
                {isLivraisonType && (
                  <>
                    <hr className="my-4" />
                    <ColisFields 
                      formData={formData}
                      onChange={handleInputChange}
                      disabled={loading}
                      show={isLivraisonType}
                    />
                  </>
                )}

                {/* Boutons d'action */}
                <hr className="my-4" />
                <div className="d-flex justify-content-between align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleCancel}
                    disabled={loading}
                    size="lg"
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Annuler
                  </Button>
                  
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Créer l'annonce
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

  // Rendu conditionnel selon l'état
  if (!currentUser) return renderNotConnected();
  if (success) return renderSuccess();
  return renderForm();
};

export default CreateAnnonce;
