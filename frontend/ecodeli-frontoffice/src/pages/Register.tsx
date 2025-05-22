import { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    role: 'CLIENT',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    vehicule: '',
    permisVerif: false,
    siret: '',
    typeService: '',
    tarifHoraire: 0
  });
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as HTMLFormElement;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Validation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setError('');
    
    try {
      // Enlever les champs inutiles selon le rôle
      const { confirmPassword, ...userData } = formData;
      
      await register(userData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
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
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Veuillez entrer votre nom.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        placeholder="Votre prénom"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Veuillez entrer votre prénom.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                {/* Champs spécifiques selon le rôle */}
                {formData.role === 'LIVREUR' && (
                  <div className="role-specific-fields mb-4">
                    <h5>Informations livreur</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Type de véhicule</Form.Label>
                          <Form.Control
                            name="vehicule"
                            value={formData.vehicule}
                            onChange={handleChange}
                            placeholder="Ex: Voiture, Camionnette..."
                            required={formData.role === 'LIVREUR'}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          className="mt-4"
                          type="checkbox"
                          name="permisVerif"
                          checked={formData.permisVerif}
                          onChange={handleChange}
                          label="Je certifie avoir un permis valide"
                          required={formData.role === 'LIVREUR'}
                        />
                      </Col>
                    </Row>
                  </div>
                )}

                {formData.role === 'COMMERCANT' && (
                  <div className="role-specific-fields mb-4">
                    <h5>Informations commerçant</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>SIRET</Form.Label>
                      <Form.Control
                        name="siret"
                        value={formData.siret}
                        onChange={handleChange}
                        placeholder="Numéro SIRET"
                        required={formData.role === 'COMMERCANT'}
                      />
                    </Form.Group>
                  </div>
                )}

                {formData.role === 'PRESTATAIRE' && (
                  <div className="role-specific-fields mb-4">
                    <h5>Informations prestataire</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Type de service</Form.Label>
                          <Form.Control
                            name="typeService"
                            value={formData.typeService}
                            onChange={handleChange}
                            placeholder="Ex: Accompagnement, Aide ménagère..."
                            required={formData.role === 'PRESTATAIRE'}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tarif horaire (€)</Form.Label>
                          <Form.Control
                            name="tarifHoraire"
                            value={formData.tarifHoraire}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            step="0.5"
                            required={formData.role === 'PRESTATAIRE'}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Votre adresse email"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Veuillez entrer une adresse email valide.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Téléphone</Form.Label>
                      <Form.Control
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="Votre numéro de téléphone"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Veuillez entrer votre numéro de téléphone.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={6}
                        placeholder="Créer un mot de passe"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Le mot de passe doit contenir au moins 6 caractères.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmation</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmer votre mot de passe"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Veuillez confirmer votre mot de passe.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Check
                    required
                    label={
                      <span>
                        J'accepte les <Link to="/terms" className="text-decoration-none">conditions d'utilisation</Link> et la <Link to="/privacy" className="text-decoration-none">politique de confidentialité</Link>
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
                Déjà inscrit ? <Link to="/login" className="text-decoration-none">Se connecter</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;