import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateEmail, validateRequired } from '../utils/helpers';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  
  const { login, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    const newErrors: { [key: string]: string } = {};
    if (!validateRequired(email)) newErrors.email = 'Email requis';
    else if (!validateEmail(email)) newErrors.email = 'Email invalide';
    if (!validateRequired(password)) newErrors.password = 'Mot de passe requis';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await login(email, password);
      showSuccess('Connexion réussie ! Redirection en cours...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      showError(error.message || 'Erreur de connexion');
    }
  };

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card title="Connexion">
            {alert && (
              <Alert type={alert.type} onClose={() => setAlert(null)}>
                {alert.message}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                required
              />
              
              <Input
                type="password"
                label="Mot de passe"
                value={password}
                onChange={setPassword}
                error={errors.password}
                required
              />
              
              <Button type="submit" disabled={loading} className="w-100 mb-3">
                {loading ? 'Connexion...' : 'Se connecter'}
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
