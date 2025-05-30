import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface LoginPromptProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  message?: string;
  actionText?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ 
  show, 
  onHide, 
  title = "Connexion requise",
  message = "Vous devez être connecté pour accéder à cette fonctionnalité.",
  actionText = "cette action"
}) => {
  
  const navigate = useNavigate();
  
  const handleLogin = () => {
    onHide();
    navigate('/login');
  };
  
  const handleRegister = () => {
    onHide();
    navigate('/register');
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-primary">
          <i className="bi bi-lock-fill me-2"></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="border-0">
          <Card.Body className="text-center">
            <div className="mb-3">
              <i className="bi bi-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="mb-3">Rejoignez EcoDeli !</h5>
            <p className="text-muted mb-4">
              {message}
            </p>
            <div className="mb-3">
              <small className="text-muted">
                <i className="bi bi-check-circle text-success me-1"></i>
                Accès à toutes les fonctionnalités<br/>
                <i className="bi bi-check-circle text-success me-1"></i>
                Créer et gérer vos annonces<br/>
                <i className="bi bi-check-circle text-success me-1"></i>
                Messagerie intégrée<br/>
                <i className="bi bi-check-circle text-success me-1"></i>
                Tableau de bord personnalisé
              </small>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <div className="d-grid gap-2 w-100">
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleLogin}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Se connecter
          </Button>
          <Button 
            variant="outline-success" 
            size="lg"
            onClick={handleRegister}
          >
            <i className="bi bi-person-plus me-2"></i>
            Créer un compte
          </Button>
          <Button 
            variant="link" 
            onClick={onHide}
            className="text-muted"
          >
            Continuer sans compte
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginPrompt;
