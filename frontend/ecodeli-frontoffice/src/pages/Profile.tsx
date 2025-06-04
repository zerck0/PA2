import React, { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { userApi } from '../services/api';
import { getRoleLabel } from '../utils/helpers';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    prenom: currentUser?.user.prenom || '',
    nom: currentUser?.user.nom || '',
    email: currentUser?.user.email || '',
    telephone: ''
  });
  
  const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  
  const { 
    loading, 
    execute: updateProfile 
  } = useApi(userApi.updateProfile);

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center">
          <p>Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </Layout>
    );
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      setAlert({ type: 'success', message: 'Profil mis à jour avec succès !' });
    } catch (error: any) {
      setAlert({ type: 'danger', message: error.message || 'Erreur lors de la mise à jour du profil' });
    }
  };

  return (
    <Layout>
      <h2 className="mb-4">Mon Profil</h2>
      
      <Card>
        {alert && (
          <Alert type={alert.type} onClose={() => setAlert(null)} className="mb-4">
            {alert.message}
          </Alert>
        )}
        
        <div className="mb-4">
          <h5>Rôle: {getRoleLabel(currentUser.user.role)}</h5>
          <p className="text-muted">ID: {currentUser.user.id}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={handleChange('prenom')}
                required
              />
            </div>
            <div className="col-md-6">
              <Input
                label="Nom"
                value={formData.nom}
                onChange={handleChange('nom')}
                required
              />
            </div>
          </div>
          
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange('email')}
            required
          />
          
          <Input
            type="tel"
            label="Téléphone"
            value={formData.telephone}
            onChange={handleChange('telephone')}
          />
          
          <div className="d-flex justify-content-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default Profile;
