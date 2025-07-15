import React, { ReactNode, useEffect, useMemo } from 'react';
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
  const { currentUser, refreshCurrentUser } = useAuth();

  // Logique de restrictions intégrée
  const restrictions = useMemo(() => {
    const userStatus = currentUser?.user?.statut;
    const userRole = currentUser?.user?.role;

    // Définir les onglets autorisés selon le statut
    const getAllowedTabs = () => {
      switch (userStatus) {
        case 'NON_VERIFIE':
          return ['overview', 'documents'];
        case 'EN_ATTENTE':
          return ['overview', 'documents'];
        case 'SUSPENDU':
          return ['overview'];
        case 'REFUSE':
          return ['overview'];
        case 'VALIDE':
        default:
          return tabs.map(tab => tab.id); // Tous les onglets
      }
    };

    const allowedTabs = getAllowedTabs();
    const isRestricted = userStatus !== 'VALIDE' && (userStatus === 'NON_VERIFIE' || userStatus === 'EN_ATTENTE' || userStatus === 'SUSPENDU' || userStatus === 'REFUSE');
    const shouldShowDocumentsFirst = userStatus === 'NON_VERIFIE';

    const getStatusMessage = () => {
      switch (userStatus) {
        case 'NON_VERIFIE':
          return 'Compte non vérifié - Veuillez compléter vos documents pour accéder à toutes les fonctionnalités.';
        case 'EN_ATTENTE':
          return 'Documents en cours de vérification - Accès limité en attendant la validation.';
        case 'SUSPENDU':
          return 'Compte suspendu - Contactez le support pour plus d\'informations.';
        case 'REFUSE':
          return 'Compte refusé - Contactez le support pour plus d\'informations.';
        default:
          return '';
      }
    };

    return {
      canAccessTab: (tabId: string) => allowedTabs.includes(tabId),
      isAccountRestricted: isRestricted,
      shouldShowDocumentsFirst,
      getStatusMessage
    };
  }, [currentUser?.user?.statut, tabs]);

  // Rafraîchissement des données utilisateur au chargement
  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  // Redirection automatique vers documents si nécessaire
  useEffect(() => {
    if (restrictions.shouldShowDocumentsFirst && activeTab !== 'documents' && restrictions.canAccessTab('documents')) {
      onTabChange('documents');
    }
  }, [restrictions.shouldShowDocumentsFirst, activeTab, onTabChange, restrictions]);

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center">
          <p>Veuillez vous connecter pour accéder au dashboard.</p>
        </div>
      </Layout>
    );
  }

  // Filtrer les onglets selon les restrictions
  const filteredTabs = tabs.filter(tab => restrictions.canAccessTab(tab.id));

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
        {/* Alerte de restriction de compte */}
        {restrictions.isAccountRestricted && restrictions.getStatusMessage() && (
          <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-exclamation-triangle me-3" style={{fontSize: '1.5rem'}}></i>
            <div className="flex-grow-1">
              <strong>Accès limité</strong><br />
              {restrictions.getStatusMessage()}
            </div>
            {restrictions.canAccessTab('documents') && (
              <button 
                className="btn btn-outline-warning btn-sm ms-3"
                onClick={() => onTabChange('documents')}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Gérer mes documents
              </button>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs dashboard-nav">
          {filteredTabs.map((tab) => {
            const isRestricted = !restrictions.canAccessTab(tab.id);
            return (
              <li key={tab.id} className="nav-item">
                <button
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''} ${isRestricted ? 'disabled opacity-50' : ''}`}
                  onClick={() => restrictions.canAccessTab(tab.id) ? onTabChange(tab.id) : null}
                  disabled={isRestricted}
                  title={isRestricted ? 'Accès restreint - Complétez vos documents' : ''}
                >
                  <i className={`bi ${tab.icon} me-2`}></i>
                  {tab.label}
                  {isRestricted && <i className="bi bi-lock-fill ms-2 text-warning"></i>}
                </button>
              </li>
            );
          })}
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
