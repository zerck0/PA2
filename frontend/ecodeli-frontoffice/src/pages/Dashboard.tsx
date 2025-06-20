import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import DocumentSection from '../components/DocumentSection';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { annonceApi } from '../services/api';
import { Annonce } from '../types';
import { getRoleLabel } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    data: annonces, 
    loading: annoncesLoading, 
    execute: loadAnnonces 
  } = useApi<Annonce[]>(annonceApi.getAll);

  useEffect(() => {
    loadAnnonces();
  }, []);

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center">
          <p>Veuillez vous connecter pour accéder au dashboard.</p>
        </div>
      </Layout>
    );
  }

  const renderOverview = () => (
    <div>
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-clipboard-data service-icon text-primary"></i>
              <div className="stat-number">{annonces?.length || 0}</div>
              <div className="stat-label">Annonces</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-check-circle service-icon text-success"></i>
              <div className="stat-number">Actif</div>
              <div className="stat-label">Statut</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-person-badge service-icon text-info"></i>
              <div className="stat-number">{getRoleLabel(currentUser.user.role)}</div>
              <div className="stat-label">Rôle</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-calendar-event service-icon text-warning"></i>
              <div className="stat-number">Nouveau</div>
              <div className="stat-label">Membre</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Informations personnelles */}
      <Card title="Informations personnelles">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <strong>Nom complet:</strong>
              <p className="mb-1">{currentUser.user.prenom} {currentUser.user.nom}</p>
            </div>
            <div className="mb-3">
              <strong>Email:</strong>
              <p className="mb-1">{currentUser.user.email}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <strong>Rôle:</strong>
              <p className="mb-1">{getRoleLabel(currentUser.user.role)}</p>
            </div>
            <div className="mb-3">
              <strong>Statut du compte:</strong>
              <span className="badge bg-success">Actif</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAnnonces = () => (
    <Card title="Mes annonces">
      {annoncesLoading ? (
        <Loading />
      ) : (
        <div>
          {annonces && annonces.length > 0 ? (
            annonces.map((annonce) => (
              <div key={annonce.id} className="annonce-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="mb-2">{annonce.titre}</h6>
                    <p className="mb-2 text-muted">{annonce.description}</p>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt me-1 text-primary"></i>
                      <small className="text-muted">
                        {annonce.villeDepart} → {annonce.villeArrivee}
                      </small>
                      {annonce.prix && (
                        <>
                          <i className="bi bi-currency-euro ms-3 me-1 text-success"></i>
                          <small className="text-success fw-bold">{annonce.prix}€</small>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ms-3">
                    <Button variant="secondary" size="sm">
                      <i className="bi bi-pencil me-1"></i>
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-inbox" style={{fontSize: '3rem', color: '#6c757d'}}></i>
              <p className="mt-3 text-muted">Aucune annonce trouvée.</p>
              <Button variant="primary">
                <i className="bi bi-plus-lg me-2"></i>
                Créer une annonce
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  const renderProfile = () => (
    <Card title="Mon profil">
      <form className="profile-form">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                <i className="bi bi-person me-2"></i>
                Prénom
              </label>
              <input 
                type="text" 
                className="form-control" 
                value={currentUser.user.prenom} 
                readOnly 
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                <i className="bi bi-person me-2"></i>
                Nom
              </label>
              <input 
                type="text" 
                className="form-control" 
                value={currentUser.user.nom} 
                readOnly 
              />
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label">
            <i className="bi bi-envelope me-2"></i>
            Email
          </label>
          <input 
            type="email" 
            className="form-control" 
            value={currentUser.user.email} 
            readOnly 
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">
            <i className="bi bi-shield-check me-2"></i>
            Rôle
          </label>
          <input 
            type="text" 
            className="form-control" 
            value={getRoleLabel(currentUser.user.role)} 
            readOnly 
          />
        </div>
        
        <div className="pt-3">
          <Button variant="primary">
            <i className="bi bi-pencil me-2"></i>
            Modifier le profil
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderDocuments = () => (
    <div>
      {currentUser.user.role === 'LIVREUR' && (
        <div className="mb-4">
          <DocumentSection
            userId={currentUser.user.id}
            documentType="PERMIS_CONDUIRE"
            title="Permis de conduire"
            required={true}
          />
        </div>
      )}
      
      <div className="mb-4">
        <DocumentSection
          userId={currentUser.user.id}
          documentType="CARTE_IDENTITE"
          title="Carte d'identité"
          required={true}
        />
      </div>

      {currentUser.user.role === 'COMMERCANT' && (
        <div className="mb-4">
          <DocumentSection
            userId={currentUser.user.id}
            documentType="KBIS"
            title="Extrait KBIS"
            required={true}
          />
        </div>
      )}
    </div>
  );

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
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="bi bi-house-door me-2"></i>
              Vue d'ensemble
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'annonces' ? 'active' : ''}`}
              onClick={() => setActiveTab('annonces')}
            >
              <i className="bi bi-megaphone me-2"></i>
              Annonces
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person me-2"></i>
              Profil
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              Documents
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'annonces' && renderAnnonces()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'documents' && renderDocuments()}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
