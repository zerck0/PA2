import React, { useState, useEffect } from 'react';
import DashboardLayout from './shared/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import DocumentSection from '../../components/DocumentSection';
import CreateAnnonceModal from '../../components/CreateAnnonceModal';
import AnnonceCard from '../../components/AnnonceCard';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { annonceApi } from '../../services/api';
import { Annonce } from '../../types';
import { useNavigate } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  
  const { 
    data: annonces, 
    loading: annoncesLoading, 
    execute: loadAnnonces 
  } = useApi<Annonce[]>(annonceApi.getAll);

  useEffect(() => {
    loadAnnonces();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'bi-house-door' },
    { id: 'annonces', label: 'Mes annonces', icon: 'bi-megaphone' },
    { id: 'reservations', label: 'Mes réservations', icon: 'bi-calendar-check' },
    { id: 'paiements', label: 'Mes paiements', icon: 'bi-credit-card' },
    { id: 'documents', label: 'Documents', icon: 'bi-file-earmark-text' }
  ];

  const renderOverview = () => (
    <div>
      {/* Alerte pour compte non vérifié */}
      {currentUser?.user.statut === 'NON_VERIFIE' && (
        <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-3" style={{fontSize: '1.5rem'}}></i>
          <div className="flex-grow-1">
            <strong>Compte non vérifié</strong><br />
            Votre adresse email n'est pas encore vérifiée. Vérifiez votre boîte mail ou cliquez sur le bouton ci-dessous pour renvoyer l'email de vérification.
          </div>
          <Button variant="secondary" size="sm" className="ms-3">
            <i className="bi bi-envelope me-2"></i>
            Renvoyer l'email
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-box-seam service-icon text-primary"></i>
              <div className="stat-number">{annonces?.length || 0}</div>
              <div className="stat-label">Annonces publiées</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-truck service-icon text-success"></i>
              <div className="stat-number">0</div>
              <div className="stat-label">Livraisons en cours</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-archive service-icon text-info"></i>
              <div className="stat-number">0</div>
              <div className="stat-label">Box louées</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-star service-icon text-warning"></i>
              <div className="stat-number">0</div>
              <div className="stat-label">Évaluations</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions rapides */}
      <Card title="Actions rapides">
        <div className="row">
          <div className="col-md-6">
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <i className="bi bi-plus-lg me-2"></i>
                Déposer une annonce
              </Button>
              <Button variant="secondary">
                <i className="bi bi-search me-2"></i>
                Rechercher un livreur
              </Button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-grid gap-2">
              <Button variant="success">
                <i className="bi bi-calendar-plus me-2"></i>
                Réserver un service
              </Button>
              <Button variant="secondary">
                <i className="bi bi-archive me-2"></i>
                Louer une box
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAnnonces = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Mes annonces</h4>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>
          Nouvelle annonce
        </Button>
      </div>
      
      {annoncesLoading ? (
        <div className="text-center py-5">
          <Loading />
        </div>
      ) : (
        <>
          {annonces && annonces.length > 0 ? (
            <div className="row g-4">
              {annonces.map((annonce) => (
                <div key={annonce.id} className="col-lg-6">
                  <AnnonceCard
                    annonce={annonce}
                    onEdit={(id) => {
                      // TODO: Implémenter l'édition
                      console.log('Éditer annonce', id);
                    }}
                    showActions={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{fontSize: '4rem', color: '#6c757d'}}></i>
                <h5 className="mt-3 text-muted">Aucune annonce trouvée</h5>
                <p className="text-muted mb-4">Vous n'avez pas encore créé d'annonce. Commencez dès maintenant !</p>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <i className="bi bi-plus-lg me-2"></i>
                  Créer ma première annonce
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderReservations = () => (
    <Card title="Mes réservations">
      <div className="text-center py-4">
        <i className="bi bi-calendar-check" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Aucune réservation en cours.</p>
        <Button variant="primary">
          <i className="bi bi-plus-lg me-2"></i>
          Réserver un service
        </Button>
      </div>
    </Card>
  );

  const renderPaiements = () => (
    <Card title="Mes paiements">
      <div className="text-center py-4">
        <i className="bi bi-credit-card" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Aucun paiement enregistré.</p>
        <Button variant="primary">
          <i className="bi bi-plus-lg me-2"></i>
          Configurer un moyen de paiement
        </Button>
      </div>
    </Card>
  );

  const renderDocuments = () => (
    <div>
      <div className="mb-4">
        <DocumentSection
          userId={currentUser?.user.id || 0}
          documentType="CARTE_IDENTITE"
          title="Carte d'identité"
          required={true}
        />
      </div>
      
      <div className="mb-4">
        <DocumentSection
          userId={currentUser?.user.id || 0}
          documentType="JUSTIFICATIF_DOMICILE"
          title="Justificatif de domicile"
          required={false}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'annonces':
        return renderAnnonces();
      case 'reservations':
        return renderReservations();
      case 'paiements':
        return renderPaiements();
      case 'documents':
        return renderDocuments();
      default:
        return renderOverview();
    }
  };

  return (
    <>
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      >
        {renderContent()}
      </DashboardLayout>
      
      <CreateAnnonceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadAnnonces(); // Rafraîchir la liste des annonces
        }}
      />
    </>
  );
};

export default ClientDashboard;
