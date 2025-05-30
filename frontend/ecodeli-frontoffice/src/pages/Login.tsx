import { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import logoEco from '../assets/logoEco.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || localStorage.getItem('redirectAfterLogin') || '/dashboard';
  const message = location.state?.message;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.motDePasse);
      // Nettoyer la redirection sauvegardée
      localStorage.removeItem('redirectAfterLogin');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="registration-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <img 
                    src={logoEco} 
                    alt="EcoDeli" 
                    style={{ maxHeight: '80px', maxWidth: '200px' }}
                    className="mb-3"
                  />
                  <h2 className="text-primary mb-3">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Connexion
                  </h2>
                  <p className="text-muted">
                    Connectez-vous à votre compte EcoDeli
                  </p>
                </div>

                {message && (
                  <Alert variant="info" className="mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    {message}
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bi bi-envelope me-1"></i>
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      size="lg"
                      placeholder="votre@email.com"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <i className="bi bi-lock me-1"></i>
                      Mot de passe
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="motDePasse"
                      value={formData.motDePasse}
                      onChange={handleChange}
                      required
                      size="lg"
                      placeholder="Votre mot de passe"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Connexion...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Se connecter
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Pas encore de compte ?{' '}
                      <Link to="/register" className="text-primary text-decoration-none">
                        <i className="bi bi-person-plus me-1"></i>
                        S'inscrire
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
