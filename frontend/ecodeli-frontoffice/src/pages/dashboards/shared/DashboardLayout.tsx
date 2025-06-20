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

  return (
    <Layout>
      {/* Dashboard Header */}
      <section className="dashboard-header text-center">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8 text-md-start">
              <h2>
                <i className="bi bi-speedometer2 me-3"></i>
                Dashboard
              </h2>
              <p className="lead">
                Bienvenue {currentUser.user.prenom} - {getRoleLabel(currentUser.user.role)}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-inline-flex align-items-center bg-white bg-opacity-20 rounded-pill px-3 py-2">
                <i className="bi bi-person-circle me-2" style={{fontSize: '1.5rem'}}></i>
                <span>{currentUser.user.prenom}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
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
