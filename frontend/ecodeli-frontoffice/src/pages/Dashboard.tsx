import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ClientDashboard from './dashboards/ClientDashboard';
import LivreurDashboard from './dashboards/LivreurDashboard';
import CommercantDashboard from './dashboards/CommercantDashboard';
import PrestataireDashboard from './dashboards/PrestataireDashboard';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center">
          <p>Veuillez vous connecter pour accéder au dashboard.</p>
        </div>
      </Layout>
    );
  }

  // Router vers le bon dashboard selon le rôle
  switch (currentUser.user.role) {
    case 'CLIENT':
      return <ClientDashboard />;
    case 'LIVREUR':
      return <LivreurDashboard />;
    case 'COMMERCANT':
      return <CommercantDashboard />;
    case 'PRESTATAIRE':
      return <PrestataireDashboard />;
    default:
      return (
        <Layout>
          <div className="text-center">
            <p>Rôle utilisateur non reconnu.</p>
          </div>
        </Layout>
      );
  }
};

export default Dashboard;
