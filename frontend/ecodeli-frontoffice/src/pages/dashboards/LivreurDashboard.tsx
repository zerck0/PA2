import React, { useState, useEffect } from 'react';
import DashboardLayout from './shared/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import DocumentSection from '../../components/DocumentSection';
import AnnonceCard from '../../components/AnnonceCard';
import { useAuth } from '../../hooks/useAuth';
import { Annonce, Livraison } from '../../types';
import { livraisonApi } from '../../services/api';

const LivreurDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [livraisonsLoading, setLivraisonsLoading] = useState(false);

  // Gérer le paramètre tab depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'livraisons') {
      setActiveTab('livraisons');
    }
  }, []);

  // Charger les livraisons du livreur
  useEffect(() => {
    if (currentUser?.user.id && activeTab === 'livraisons') {
      loadLivraisons();
    }
  }, [currentUser, activeTab]);

  const loadLivraisons = async () => {
    if (!currentUser?.user.id) return;
    
    setLivraisonsLoading(true);
    try {
      const mesLivraisons = await livraisonApi.getLivraisonsByLivreur(currentUser.user.id);
      setLivraisons(mesLivraisons);
    } catch (error: any) {
      console.error('Erreur lors du chargement des livraisons:', error);
      setLivraisons([]);
    } finally {
      setLivraisonsLoading(false);
    }
  };

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

  // Fonction pour obtenir le badge du statut de livraison
  const getStatutLivraisonBadge = (statut: string) => {
    const badges = {
      'EN_ATTENTE': { color: 'secondary', label: 'En attente' },
      'ACCEPTEE': { color: 'info', label: 'Acceptée' },
      'EN_COURS': { color: 'warning', label: 'En cours' },
      'LIVREE': { color: 'success', label: 'Livrée' },
      'STOCKEE': { color: 'primary', label: 'Stockée' },
      'ANNULEE': { color: 'danger', label: 'Annulée' },
      'ECHEC': { color: 'danger', label: 'Échec' }
    };
    const badge = badges[statut as keyof typeof badges] || { color: 'secondary', label: statut };
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>;
  };

  // Fonction pour obtenir le badge du type de livraison
  const getTypeLivraisonBadge = (type: string) => {
    const badges = {
      'COMPLETE': { color: 'success', label: 'Complète' },
      'PARTIELLE_DEPOT': { color: 'warning', label: 'Partielle - Dépôt' },
      'PARTIELLE_RETRAIT': { color: 'info', label: 'Partielle - Retrait' }
    };
    const badge = badges[type as keyof typeof badges] || { color: 'secondary', label: type };
    return <span className={`badge bg-${badge.color} me-2`}>{badge.label}</span>;
  };

  const renderLivraisons = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Mes livraisons</h4>
        <Button variant="primary" onClick={() => window.location.href = '/annonces'}>
          <i className="bi bi-search me-2"></i>
          Rechercher des missions
        </Button>
      </div>

      {livraisonsLoading ? (
        <div className="text-center py-5">
          <Loading />
        </div>
      ) : (
        <>
          {livraisons && livraisons.length > 0 ? (
            <div className="row g-4">
              {livraisons.map((livraison) => (
                <div key={livraison.id} className="col-lg-6">
                  <AnnonceCard
                    annonce={livraison.annonce}
                    showActions={false}
                    extraInfo={
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex gap-2 mb-2">
                          {getTypeLivraisonBadge(livraison.typeLivraison)}
                          {getStatutLivraisonBadge(livraison.statut)}
                        </div>
                        {livraison.entrepot && (
                          <div className="mb-2">
                            <small className="text-muted d-block">
                              <i className="bi bi-building me-1"></i>
                              Entrepôt
                            </small>
                            <strong>{livraison.entrepot.nom} - {livraison.entrepot.ville}</strong>
                          </div>
                        )}
                        <div className="mb-2">
                          <small className="text-muted d-block">Code de validation</small>
                          <code className="bg-light p-1 rounded">{livraison.codeValidation}</code>
                        </div>
                        <div className="d-flex gap-2">
                          {livraison.statut === 'ACCEPTEE' && (
                            <Button variant="success" size="sm">
                              <i className="bi bi-play-fill me-1"></i>
                              Commencer
                            </Button>
                          )}
                          {livraison.statut === 'EN_COURS' && (
                            <Button variant="primary" size="sm">
                              <i className="bi bi-check-circle me-1"></i>
                              Terminer
                            </Button>
                          )}
                        </div>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-5">
                <i className="bi bi-truck" style={{fontSize: '4rem', color: '#6c757d'}}></i>
                <h5 className="mt-3 text-muted">Aucune livraison en cours</h5>
                <p className="text-muted mb-4">
                  Vous n'avez pas encore de mission assignée. 
                  Recherchez des annonces disponibles pour commencer.
                </p>
                <Button variant="primary" onClick={() => window.location.href = '/annonces'}>
                  <i className="bi bi-search me-2"></i>
                  Voir les annonces disponibles
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
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
