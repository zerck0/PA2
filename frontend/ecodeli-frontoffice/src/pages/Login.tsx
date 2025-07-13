import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validation simple
  const validateForm = (): string | null => {
    if (!email.trim()) return 'Email requis';
    if (!email.includes('@')) return 'Email invalide';
    if (!password.trim()) return 'Mot de passe requis';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation côté frontend
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Redirection réussie sera gérée par le context d'auth
      navigate('/dashboard');
    } catch (error: any) {
      // Récupérer le message d'erreur du backend ou utiliser un message générique
      const errorMessage = error.response?.data?.message || 'Email ou mot de passe incorrect';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser l'erreur quand l'utilisateur tape
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError('');
  };

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card title="Connexion">
            {error && (
              <Alert type="danger">
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={handleEmailChange}
                required
              />
              
              <Input
                type="password"
                label="Mot de passe"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              
              <Button type="submit" disabled={isLoading} className="w-100 mb-3">
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            
            <div className="text-center">
              <Link to="/register">Pas encore inscrit ? Créer un compte</Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
