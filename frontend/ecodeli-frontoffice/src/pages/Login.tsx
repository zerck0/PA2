import { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useContext(AuthContext);

  // Récupérer l'URL de redirection si elle existe
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as HTMLFormElement;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setError('');
    
    try {
      await login(email, password);
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Connexion</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer une adresse email valide.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez entrer votre mot de passe.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Se souvenir de moi"
                  />
                  <Link to="/forgot-password" className="text-decoration-none">Mot de passe oublié ?</Link>
                </div>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                Pas encore de compte ? <Link to="/register" className="text-decoration-none">S'inscrire</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;