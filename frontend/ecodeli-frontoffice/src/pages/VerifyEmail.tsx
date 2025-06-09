import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Récupérer userId et email depuis les paramètres URL
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info', message: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Rediriger si pas d'userId
  useEffect(() => {
    if (!userId) {
      navigate('/register');
    }
  }, [userId, navigate]);

  // Timer pour le bouton "Renvoyer"
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim() || code.length !== 6) {
      setAlert({ type: 'danger', message: 'Veuillez entrer un code à 6 chiffres' });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const response = await fetch('http://localhost:8080/api/verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId!),
          code: code.trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setAlert({ type: 'success', message: 'Email vérifié avec succès ! Redirection...' });
        
        // Redirection vers le dashboard après 2 secondes
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setAlert({ type: 'danger', message: data.message || 'Code invalide ou expiré' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erreur de connexion au serveur' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    setAlert(null);

    try {
      const response = await fetch('http://localhost:8080/api/verification/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId!)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Un nouveau code a été envoyé !' });
        setTimeLeft(60); // Attendre 1 minute avant de pouvoir renvoyer
        setCode(''); // Vider le champ
      } else {
        setAlert({ type: 'danger', message: data.message || 'Erreur lors du renvoi' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erreur de connexion au serveur' });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!userId) {
    return null; // Le useEffect redirigera
  }

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <Card title="Vérification Email">
            <div className="text-center mb-4">
              <div className="mb-3">
                <i className="bi bi-envelope-check fs-1 text-primary"></i>
              </div>
              <p className="mb-2">
                Un code de vérification a été envoyé à :
              </p>
              <strong className="text-primary">{email}</strong>
              <p className="text-muted mt-2 small">
                Le code expire dans 15 minutes
              </p>
            </div>

            {alert && (
              <Alert type={alert.type} onClose={() => setAlert(null)}>
                {alert.message}
              </Alert>
            )}

            <form onSubmit={handleVerifyCode}>
              <div className="mb-3">
                <label className="form-label">Code de vérification *</label>
                <input
                  type="text"
                  className="form-control text-center"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  style={{ fontSize: '1.2rem', letterSpacing: '0.5rem' }}
                  required
                />
              </div>

              <div className="d-grid gap-2 mb-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? 'Vérification...' : 'Vérifier'}
                </Button>
              </div>
            </form>

            <div className="text-center">
              <p className="mb-2">Vous n'avez pas reçu le code ?</p>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendCode}
                disabled={isResending || timeLeft > 0}
              >
                {isResending ? 'Envoi...' : 
                 timeLeft > 0 ? `Renvoyer (${formatTime(timeLeft)})` : 
                 'Renvoyer le code'}
              </Button>
            </div>

            <div className="text-center mt-4">
              <small className="text-muted">
                <a href="/register" className="text-decoration-none">
                  ← Retour à l'inscription
                </a>
              </small>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
