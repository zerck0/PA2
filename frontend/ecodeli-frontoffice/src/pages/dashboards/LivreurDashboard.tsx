import React, { useState } from 'react';
import DashboardLayout from './shared/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DocumentSection from '../../components/DocumentSection';
import { useAuth } from '../../hooks/useAuth';

const LivreurDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'bi-house-door' },
    { id: 'annonces', label: 'Mes annonces', icon: 'bi-megaphone' },
    { id: 'livraisons', label: 'Mes livraisons', icon: 'bi-truck' },
    { id: 'planning', label: 'Mon planning', icon: 'bi-calendar' },
    { id: 'paiements', label: 'Mes paiements', icon: 'bi-credit-card' },
    { id: 'documents', label: 'Pièces justificatives', icon: 'bi-file-earmark-text' }
  ];

  const renderOverview = () => (
    <div>
      {/* Alerte pour compte non vérifié */}
      {currentUser?.user.statut === 'NON_VERIFIE' && (
        <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-3" style={{fontSize: '1.5rem'}}></i>
          <div className="flex-grow-1">
            <strong>Compte non vérifié</strong><br />
            Votre adresse email n'est pas encore vérifiée. Certaines fonctionnalités peuvent être limitées.
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
              <i className="bi bi-truck service-icon text-primary"></i>
              <div className="stat-number">0</div>
              <div className="stat-label">Livraisons effectuées</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-currency-euro service-icon text-success"></i>
              <div className="stat-number">0€</div>
              <div className="stat-label">Gains ce mois</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-star service-icon text-warning"></i>
              <div className="stat-number">5.0</div>
              <div className="stat-label">Note moyenne</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-clock service-icon text-info"></i>
              <div className="stat-number">0</div>
              <div className="stat-label">Missions en cours</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions rapides */}
      <Card title="Actions rapides">
        <div className="row">
          <div className="col-md-6">
            <div className="d-grid gap-2">
              <Button variant="primary">
                <i className="bi bi-plus-lg me-2"></i>
                Ajouter un trajet
              </Button>
              <Button variant="secondary">
                <i className="bi bi-search me-2"></i>
                Rechercher des missions
              </Button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-grid gap-2">
              <Button variant="success">
                <i className="bi bi-check-circle me-2"></i>
                Valider une livraison
              </Button>
              <Button variant="secondary">
                <i className="bi bi-calendar me-2"></i>
                Gérer mon planning
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAnnonces = () => (
    <Card title="Mes trajets prévisionnels">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Trajets proposés</h6>
        <Button variant="primary">
          <i className="bi bi-plus-lg me-2"></i>
          Nouveau trajet
        </Button>
      </div>
      
      <div className="text-center py-4">
        <i className="bi bi-road" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Aucun trajet proposé.</p>
        <p className="text-muted small">
          Ajoutez vos trajets prévisionnels pour recevoir des notifications 
          quand des clients cherchent un livreur sur votre route.
        </p>
        <Button variant="primary">
          <i className="bi bi-plus-lg me-2"></i>
          Ajouter mon premier trajet
        </Button>
      </div>
    </Card>
  );

  const renderLivraisons = () => (
    <Card title="Mes livraisons">
      <div className="text-center py-4">
        <i className="bi bi-truck" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Aucune livraison en cours.</p>
        <Button variant="primary">
          <i className="bi bi-search me-2"></i>
          Rechercher des missions
        </Button>
      </div>
    </Card>
  );

  const renderPlanning = () => (
    <Card title="Mon planning">
      <div className="text-center py-4">
        <i className="bi bi-calendar" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Aucune mission planifiée.</p>
        <Button variant="primary">
          <i className="bi bi-calendar-plus me-2"></i>
          Planifier mes disponibilités
        </Button>
      </div>
    </Card>
  );

  const renderPaiements = () => (
    <Card title="Mes paiements">
      <div className="row mb-4">
        <div className="col-md-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-wallet service-icon text-primary"></i>
              <div className="stat-number">0€</div>
              <div className="stat-label">Portefeuille EcoDeli</div>
            </div>
          </Card>
        </div>
        <div className="col-md-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-bank service-icon text-success"></i>
              <div className="stat-number">0€</div>
              <div className="stat-label">Virements demandés</div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="text-center py-4">
        <p className="text-muted">Aucun paiement enregistré.</p>
        <Button variant="primary">
          <i className="bi bi-bank me-2"></i>
          Configurer mon compte bancaire
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
          documentType="PERMIS_CONDUIRE"
          title="Permis de conduire"
          required={true}
        />
      </div>
      
      <div className="mb-4">
        <DocumentSection
          userId={currentUser?.user.id || 0}
          documentType="ASSURANCE_VEHICULE"
          title="Assurance véhicule"
          required={true}
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
      case 'livraisons':
        return renderLivraisons();
      case 'planning':
        return renderPlanning();
      case 'paiements':
        return renderPaiements();
      case 'documents':
        return renderDocuments();
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default LivreurDashboard;
