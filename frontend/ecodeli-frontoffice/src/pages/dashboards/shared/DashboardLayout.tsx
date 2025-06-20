import React, { ReactNode } from 'react';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../hooks/useAuth';
import { getRoleLabel } from '../../../utils/helpers';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  tabs
}) => {
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

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (statut: string) => {
    // Normaliser le statut (majuscules et trim pour éviter les problèmes)
    const normalizedStatut = statut ? statut.toString().toUpperCase().trim() : '';
    
    switch (normalizedStatut) {
      case 'VALIDE':
        return <span className="badge bg-success ms-2"><i className="bi bi-check-circle me-1"></i>Vérifié</span>;
      case 'NON_VERIFIE':
        return <span className="badge bg-warning ms-2"><i className="bi bi-exclamation-triangle me-1"></i>Non vérifié</span>;
      case 'EN_ATTENTE':
        return <span className="badge bg-info ms-2"><i className="bi bi-clock me-1"></i>En attente</span>;
      case 'SUSPENDU':
        return <span className="badge bg-danger ms-2"><i className="bi bi-ban me-1"></i>Suspendu</span>;
      case 'REFUSE':
        return <span className="badge bg-danger ms-2"><i className="bi bi-x-circle me-1"></i>Refusé</span>;
      default:
        return <span className="badge bg-secondary ms-2"><i className="bi bi-question-circle me-1"></i>Inconnu</span>;
    }
  };

  return (
    <Layout>
      <div className="container">
        {/* Dashboard Header Card */}
        <div className="dashboard-header-card mb-4">
          <div className="d-flex align-items-center">
            {/* Avatar */}
            <div className="dashboard-avatar me-3">
              <i className="bi bi-person-circle"></i>
            </div>
            
            {/* User Info */}
            <div className="flex-grow-1">
              <h5 className="mb-1">
                Bienvenue, {currentUser.user.prenom}
                {getStatusBadge(currentUser.user.statut)}
              </h5>
              <p className="text-muted mb-0">
                {getRoleLabel(currentUser.user.role)} - Tableau de bord
              </p>
            </div>
            
            {/* Dashboard Title */}
            <div className="text-end">
              <h6 className="mb-0 text-primary">
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </h6>
            </div>
          </div>
        </div>
        {/* Navigation Tabs */}
        <ul className="nav nav-tabs dashboard-nav">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item">
              <button
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                <i className={`bi ${tab.icon} me-2`}></i>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {children}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardLayout;
