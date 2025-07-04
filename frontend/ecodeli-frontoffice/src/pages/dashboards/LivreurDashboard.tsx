import React, { useState, useEffect } from 'react';
import DashboardLayout from './shared/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import DocumentSection from '../../components/DocumentSection';
import LivraisonCard from '../../components/LivraisonCard';
import LivraisonDetailModal from '../../components/LivraisonDetailModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Annonce, Livraison } from '../../types';
import { livraisonApi } from '../../services/api';

const LivreurDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [livraisonsLoading, setLivraisonsLoading] = useState(false);
  const [selectedLivraison, setSelectedLivraison] = useState<Livraison | null>(null);
  const [showLivraisonModal, setShowLivraisonModal] = useState(false);

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
      
      // Pour chaque segment retrait, vérifier le statut du segment dépôt correspondant
      const livraisonsAvecVerification = await Promise.all(
        mesLivraisons.map(async (livraison: Livraison) => {
          if (livraison.typeLivraison === 'PARTIELLE_RETRAIT') {
            try {
              // Requête directe en base pour récupérer le segment dépôt
              const segmentDepot = await livraisonApi.getSegmentDepotByAnnonce(livraison.annonce.id);
              return {
                ...livraison,
                peutCommencer: segmentDepot && segmentDepot.statut === 'STOCKEE'
              };
            } catch (error) {
              console.error(`Erreur lors de la vérification du segment dépôt pour l'annonce ${livraison.annonce.id}:`, error);
              return {
                ...livraison,
                peutCommencer: false
              };
            }
          }
          
          // Pour les autres types de livraison, utiliser la logique standard
          return {
            ...livraison,
            peutCommencer: livraison.statut === 'ASSIGNEE'
          };
        })
      );
      
      setLivraisons(livraisonsAvecVerification);
    } catch (error: any) {
      console.error('Erreur lors du chargement des livraisons:', error);
      setLivraisons([]);
    } finally {
      setLivraisonsLoading(false);
    }
  };

  // Handler pour ouvrir le modal de détails de livraison
  const handleConsulterLivraison = (livraison: Livraison) => {
    setSelectedLivraison(livraison);
    setShowLivraisonModal(true);
  };

  // Handler pour fermer le modal
  const handleCloseLivraisonModal = () => {
    setSelectedLivraison(null);
    setShowLivraisonModal(false);
  };

  // Handler appelé quand une livraison est mise à jour
  const handleLivraisonUpdated = () => {
    loadLivraisons(); // Recharger la liste des livraisons
  };

  // Handler pour commencer une livraison (ASSIGNEE -> EN_COURS)
  const handleCommencerLivraison = async (livraison: Livraison) => {
    try {
      await livraisonApi.commencerLivraison(livraison.id);
      showSuccess('🚀 Livraison démarrée avec succès ! Vous pouvez maintenant commencer la livraison.');
      loadLivraisons(); // Recharger la liste
    } catch (error: any) {
      console.error('Erreur lors du démarrage de la livraison:', error);
      showError('❌ Erreur lors du démarrage de la livraison : ' + (error.response?.data?.message || error.message));
    }
  };

  // Vérifier si une livraison partielle peut être commencée
  const peutCommencerLivraisonPartielle = (livraison: any): boolean => {
    // Utiliser la propriété peutCommencer calculée lors du chargement
    return livraison.peutCommencer || false;
  };

  // Message d'aide pour les livraisons partielles en attente
  const getMessageAttenteLivraisonPartielle = (livraison: Livraison): string => {
    if (livraison.typeLivraison === 'COMPLETE') {
      return '';
    }

    // Pour le segment DÉPÔT
    if (livraison.typeLivraison === 'PARTIELLE_DEPOT') {
      return ''; // Pas de message spécial pour le segment dépôt
    }

    // Pour le segment RETRAIT, vérifier le statut du segment dépôt
    if (livraison.typeLivraison === 'PARTIELLE_RETRAIT') {
      // Chercher le segment dépôt de la même annonce
      const segmentDepot = livraisons.find(l => 
        l.annonce.id === livraison.annonce.id && 
        l.typeLivraison === 'PARTIELLE_DEPOT'
      );

      if (!segmentDepot) {
        return 'En attente qu\'un livreur prenne en charge le segment dépôt (1/2)';
      }

      // Messages selon le statut du segment dépôt
      switch (segmentDepot.statut) {
        case 'ASSIGNEE':
          return 'En attente que le livreur du segment 1 commence le dépôt vers l\'entrepôt';
        case 'EN_COURS':
          return 'Le livreur du segment 1 est en cours de dépôt vers l\'entrepôt';
        case 'STOCKEE':
          return ''; // Segment dépôt terminé, pas de message d'attente
        default:
          return 'En attente que le segment dépôt soit terminé';
      }
    }

    return '';
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
                  <LivraisonCard
                    livraison={livraison}
                    onConsulter={handleConsulterLivraison}
                    onCommencer={handleCommencerLivraison}
                    peutCommencer={peutCommencerLivraisonPartielle(livraison)}
                    messageAttente={getMessageAttenteLivraisonPartielle(livraison)}
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
    <>
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      >
        {renderContent()}
      </DashboardLayout>

      {/* Modal de détails de livraison */}
      <LivraisonDetailModal
        isOpen={showLivraisonModal}
        onClose={handleCloseLivraisonModal}
        livraison={selectedLivraison}
        onLivraisonUpdated={handleLivraisonUpdated}
      />
    </>
  );
};

export default LivreurDashboard;
