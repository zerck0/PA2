import React, { useState, useEffect } from 'react';
import DashboardLayout from './shared/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import CreateAnnonceCommercantModal from '../../components/CreateAnnonceCommercantModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { AnnonceCommercant } from '../../types';
import { annonceCommercantApi } from '../../services/api';

const CommercantDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [annonces, setAnnonces] = useState<AnnonceCommercant[]>([]);
  const [annoncesLoading, setAnnoncesLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [countAnnonces, setCountAnnonces] = useState(0);

  // Charger les annonces du commerçant
  useEffect(() => {
    if (currentUser?.user.id && activeTab === 'annonces') {
      loadAnnonces();
    }
  }, [currentUser, activeTab]);

  // Charger le nombre d'annonces pour les stats
  useEffect(() => {
    if (currentUser?.user.id) {
      loadCountAnnonces();
    }
  }, [currentUser]);

  const loadAnnonces = async () => {
    if (!currentUser?.user.id) return;
    
    setAnnoncesLoading(true);
    try {
      const mesAnnonces = await annonceCommercantApi.getByCommercant(currentUser.user.id);
      setAnnonces(mesAnnonces);
    } catch (error: any) {
      console.error('Erreur lors du chargement des annonces:', error);
      showError('Erreur lors du chargement des annonces');
      setAnnonces([]);
    } finally {
      setAnnoncesLoading(false);
    }
  };

  const loadCountAnnonces = async () => {
    if (!currentUser?.user.id) return;
    
    try {
      const count = await annonceCommercantApi.countByCommercant(currentUser.user.id);
      setCountAnnonces(count);
    } catch (error) {
      console.error('Erreur lors du chargement du nombre d\'annonces:', error);
    }
  };

  const handleCreateAnnonce = async (annonceData: any) => {
    if (!currentUser?.user.id) return;

    try {
      await annonceCommercantApi.create(annonceData, currentUser.user.id);
      showSuccess('🎉 Annonce créée avec succès !');
      setShowCreateModal(false);
      loadAnnonces();
      loadCountAnnonces();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      showError('❌ Erreur lors de la création de l\'annonce : ' + (error.response?.data || error.message));
    }
  };

  const handleDeleteAnnonce = async (annonceId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await annonceCommercantApi.delete(annonceId);
        showSuccess('Annonce supprimée avec succès');
        loadAnnonces();
        loadCountAnnonces();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        showError('Erreur lors de la suppression de l\'annonce');
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'bi-house-door' },
    { id: 'annonces', label: 'Mes annonces', icon: 'bi-megaphone' },
    { id: 'contrat', label: 'Mon contrat', icon: 'bi-file-earmark-text' },
    { id: 'facturation', label: 'Facturation', icon: 'bi-receipt' },
    { id: 'paiements', label: 'Paiements', icon: 'bi-credit-card' }
  ];

  const renderOverview = () => (
    <div>
      {/* Alerte pour compte non vérifié */}
      {currentUser?.user.statut === 'NON_VERIFIE' && (
        <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-3" style={{fontSize: '1.5rem'}}></i>
          <div className="flex-grow-1">
            <strong>Compte non vérifié</strong><br />
            Votre compte commerçant n'est pas encore vérifié. Certaines fonctionnalités peuvent être limitées.
          </div>
          <Button variant="secondary" size="sm" className="ms-3">
            <i className="bi bi-envelope me-2"></i>
            Contacter le support
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-megaphone service-icon text-primary"></i>
              <div className="stat-number">{countAnnonces}</div>
              <div className="stat-label">Annonces actives</div>
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
              <i className="bi bi-currency-euro service-icon text-warning"></i>
              <div className="stat-number">0€</div>
              <div className="stat-label">CA du mois</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3 col-sm-6">
          <Card className="stat-card h-100">
            <div className="card-body">
              <i className="bi bi-people service-icon text-info"></i>
              <div className="stat-number">0</div>
              <div className="stat-label">Livreurs affiliés</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions rapides */}
      <Card title="Actions rapides">
        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Créer une nouvelle annonce
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setActiveTab('annonces')}
          >
            <i className="bi bi-megaphone me-2"></i>
            Gérer mes annonces
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderAnnonces = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Mes annonces</h4>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle annonce
        </Button>
      </div>

      {annoncesLoading ? (
        <div className="text-center py-5">
          <Loading />
        </div>
      ) : (
        <>
          {annonces.length > 0 ? (
            <div className="row g-4">
              {annonces.map((annonce) => (
                <div key={annonce.id} className="col-lg-6">
                  <Card>
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{annonce.titre}</h6>
                      <div className="d-flex gap-2">
                        <span className={`badge ${
                          annonce.statut === 'ACTIVE' ? 'bg-success' :
                          annonce.statut === 'ASSIGNEE' ? 'bg-warning' :
                          annonce.statut === 'EN_COURS' ? 'bg-info' :
                          annonce.statut === 'TERMINEE' ? 'bg-secondary' :
                          'bg-danger'
                        }`}>
                          {annonce.statut}
                        </span>
                        {annonce.reserveAuxAffilies && (
                          <span className="badge bg-primary">Affiliés</span>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="text-muted mb-3">{annonce.description}</p>
                      
                      <div className="mb-3">
                        <h6 className="small text-primary mb-2">Liste des courses :</h6>
                        <p className="small bg-light p-2 rounded">{annonce.listeCourses}</p>
                      </div>

                      <div className="row text-center mb-3">
                        <div className="col-4">
                          <div className="text-primary">
                            <i className="bi bi-geo-alt"></i>
                          </div>
                          <small className="text-muted">{annonce.villeDepart} → {annonce.villeArrivee}</small>
                        </div>
                        <div className="col-4">
                          <div className="text-success">
                            <i className="bi bi-currency-euro"></i>
                          </div>
                          <small className="text-muted">{annonce.prixPropose}€</small>
                        </div>
                        <div className="col-4">
                          <div className="text-info">
                            <i className="bi bi-box"></i>
                          </div>
                          <small className="text-muted">{annonce.quantiteProduits || 0} articles</small>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <Button variant="outline-primary" size="sm">
                          <i className="bi bi-pencil me-1"></i>
                          Modifier
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteAnnonce(annonce.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-5">
                <i className="bi bi-megaphone" style={{fontSize: '4rem', color: '#6c757d'}}></i>
                <h5 className="mt-3 text-muted">Aucune annonce créée</h5>
                <p className="text-muted mb-4">
                  Créez votre première annonce pour proposer vos services aux livreurs affiliés EcoDeli.
                </p>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Créer ma première annonce
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderContrat = () => (
    <Card title="Mon contrat EcoDeli">
      <div className="text-center py-5">
        <i className="bi bi-file-earmark-text" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Gestion des contrats en cours de développement</p>
        <p className="text-muted small">
          Cette section permettra de consulter et gérer votre contrat commerçant avec EcoDeli.
        </p>
      </div>
    </Card>
  );

  const renderFacturation = () => (
    <Card title="Facturation">
      <div className="text-center py-5">
        <i className="bi bi-receipt" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Gestion de la facturation en cours de développement</p>
        <p className="text-muted small">
          Cette section permettra de gérer la facturation des services demandés.
        </p>
      </div>
    </Card>
  );

  const renderPaiements = () => (
    <Card title="Paiements">
      <div className="text-center py-5">
        <i className="bi bi-credit-card" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Gestion des paiements en cours de développement</p>
        <p className="text-muted small">
          Cette section permettra de suivre et gérer vos paiements.
        </p>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'annonces':
        return renderAnnonces();
      case 'contrat':
        return renderContrat();
      case 'facturation':
        return renderFacturation();
      case 'paiements':
        return renderPaiements();
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

      {/* Modal de création d'annonce */}
      <CreateAnnonceCommercantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateAnnonce}
      />
    </>
  );
};

export default CommercantDashboard;
