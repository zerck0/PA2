import React, { useState, useEffect } from 'react';
import DashboardLayout from './shared/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import DocumentSection from '../../components/DocumentSection';
import CreateAnnonceModal from '../../components/CreateAnnonceModal';
import AnnonceCard from '../../components/AnnonceCard';
import LivraisonCard from '../../components/LivraisonCard';
import LivraisonDetailModal from '../../components/LivraisonDetailModal';
import PrestationCard from '../../components/PrestationCard';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { annonceApi, livraisonApi, prestationApi } from '../../services/api';
import { Annonce, Livraison, Prestation } from '../../types';

const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [livraisonsLoading, setLivraisonsLoading] = useState(false);
  const [filtreActif, setFiltreActif] = useState<string>('tous');
  const [selectedLivraison, setSelectedLivraison] = useState<Livraison | null>(null);
  const [showLivraisonModal, setShowLivraisonModal] = useState(false);
  
  // États pour les prestations
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [prestationsLoading, setPrestationsLoading] = useState(false);
  const [filtrePrestations, setFiltrePrestations] = useState<string>('toutes');
  
  const { 
    data: annonces, 
    loading: annoncesLoading, 
    execute: loadAnnonces 
  } = useApi<Annonce[]>(() => annonceApi.getMesAnnonces(currentUser?.user.id || 0));

  useEffect(() => {
    if (currentUser?.user.id) {
      loadAnnonces();
    }
  }, [currentUser]);

  // Charger les livraisons de toutes les annonces du client
  useEffect(() => {
    if (currentUser?.user.id && activeTab === 'livraisons') {
      loadLivraisons();
    }
  }, [currentUser, activeTab]);

  // Charger les prestations du client
  useEffect(() => {
    if (currentUser?.user.id && activeTab === 'reservations') {
      loadPrestations();
    }
  }, [currentUser, activeTab]);

  const loadLivraisons = async () => {
    if (!currentUser?.user.id || !annonces?.length) return;
    
    setLivraisonsLoading(true);
    try {
      // Pour chaque annonce du client, récupérer ses livraisons
      const toutesLivraisons: Livraison[] = [];
      for (const annonce of annonces) {
        try {
          const livraisonsAnnonce = await livraisonApi.getLivraisonsByAnnonce(annonce.id);
          toutesLivraisons.push(...livraisonsAnnonce);
        } catch (error) {
          // Gestion silencieuse des erreurs de livraisons
        }
      }
      setLivraisons(toutesLivraisons);
    } catch (error: any) {
      setLivraisons([]);
    } finally {
      setLivraisonsLoading(false);
    }
  };

  // Handlers pour le modal de livraison (côté client = lecture seule)
  const handleConsulterLivraison = (livraison: Livraison) => {
    setSelectedLivraison(livraison);
    setShowLivraisonModal(true);
  };

  const handleCloseLivraisonModal = () => {
    setSelectedLivraison(null);
    setShowLivraisonModal(false);
  };

  const handleLivraisonUpdated = () => {
    loadLivraisons(); // Recharger les livraisons
  };

  // Charger les prestations du client
  const loadPrestations = async () => {
    if (!currentUser?.user.id) return;
    
    setPrestationsLoading(true);
    try {
      const prestationsClient = await prestationApi.getByClient(currentUser.user.id);
      setPrestations(prestationsClient);
    } catch (error: any) {
      setPrestations([]);
    } finally {
      setPrestationsLoading(false);
    }
  };

  // Callback après évaluation d'une prestation
  const handleEvaluationSubmitted = () => {
    // Optionnel : recharger les prestations ou mettre à jour l'état
    loadPrestations();
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'bi-house-door' },
    { id: 'annonces', label: 'Mes annonces', icon: 'bi-megaphone' },
    { id: 'livraisons', label: 'Suivi livraisons', icon: 'bi-truck' },
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
        <div className="d-grid gap-2">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>
            Déposer une annonce
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setActiveTab('annonces')}
          >
            <i className="bi bi-megaphone me-2"></i>
            Voir mes annonces
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderAnnonces = () => {
    // Grouper les annonces par statut pour une meilleure présentation
    const annoncesActives = annonces?.filter(a => a.statut === 'ACTIVE') || [];
    const annoncesAssignees = annonces?.filter(a => a.statut === 'ASSIGNEE') || [];
    const annoncesEnCours = annonces?.filter(a => a.statut === 'EN_COURS') || [];
    const annoncesTerminees = annonces?.filter(a => a.statut === 'TERMINEE') || [];

    return (
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
              <div>
                {/* Annonces actives */}
                {annoncesActives.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-success mb-3">
                      <i className="bi bi-circle-fill me-2"></i>
                      Annonces disponibles ({annoncesActives.length})
                    </h5>
                    <div className="row g-4">
                      {annoncesActives.map((annonce) => (
                        <div key={annonce.id} className="col-lg-6">
                          <AnnonceCard
                            annonce={annonce}
                            onEdit={(id) => {
                              // Action d'édition à implémenter
                            }}
                            showActions={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Annonces assignées */}
                {annoncesAssignees.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-warning mb-3">
                      <i className="bi bi-person-check-fill me-2"></i>
                      Annonces assignées ({annoncesAssignees.length})
                    </h5>
                    <div className="row g-4">
                      {annoncesAssignees.map((annonce) => (
                        <div key={annonce.id} className="col-lg-6">
                          <AnnonceCard
                            annonce={annonce}
                            showActions={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Annonces en cours */}
                {annoncesEnCours.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-info mb-3">
                      <i className="bi bi-truck me-2"></i>
                      Livraisons en cours ({annoncesEnCours.length})
                    </h5>
                    <div className="row g-4">
                      {annoncesEnCours.map((annonce) => (
                        <div key={annonce.id} className="col-lg-6">
                          <AnnonceCard
                            annonce={annonce}
                            showActions={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Annonces terminées */}
                {annoncesTerminees.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-secondary mb-3">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Livraisons terminées ({annoncesTerminees.length})
                    </h5>
                    <div className="row g-4">
                      {annoncesTerminees.map((annonce) => (
                        <div key={annonce.id} className="col-lg-6">
                          <AnnonceCard
                            annonce={annonce}
                            showActions={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
  };

  const renderLivraisons = () => {
    // Grouper les livraisons par statut (même logique que LivreurDashboard)
    const livraisonsACommencer = livraisons?.filter(l => l.statut === 'ASSIGNEE') || [];
    const livraisonsEnCours = livraisons?.filter(l => l.statut === 'EN_COURS') || [];
    const livraisonsTerminees = livraisons?.filter(l => ['STOCKEE', 'LIVREE'].includes(l.statut)) || [];
    const livraisonsAnnulees = livraisons?.filter(l => l.statut === 'ANNULEE') || [];

    // Fonction pour filtrer les livraisons selon le filtre actif
    const getLivraisonsFiltrees = () => {
      switch (filtreActif) {
        case 'a-commencer':
          return livraisonsACommencer;
        case 'en-cours':
          return livraisonsEnCours;
        case 'terminees':
          return livraisonsTerminees;
        case 'annulees':
          return livraisonsAnnulees;
        default:
          return livraisons || [];
      }
    };

    const livraisonsFiltrees = getLivraisonsFiltrees();

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Suivi de mes livraisons</h4>
          <Button variant="secondary" onClick={() => setActiveTab('annonces')}>
            <i className="bi bi-megaphone me-2"></i>
            Voir mes annonces
          </Button>
        </div>

        {/* Filtres (réutilise la logique du LivreurDashboard) */}
        <Card className="mb-4">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant={filtreActif === 'tous' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setFiltreActif('tous')}
              >
                <i className="bi bi-list me-1"></i>
                Tous ({livraisons?.length || 0})
              </Button>
              
              <Button
                variant={filtreActif === 'a-commencer' ? 'warning' : 'outline-warning'}
                size="sm"
                onClick={() => setFiltreActif('a-commencer')}
              >
                <i className="bi bi-clock me-1"></i>
                À commencer ({livraisonsACommencer.length})
              </Button>
              
              <Button
                variant={filtreActif === 'en-cours' ? 'info' : 'outline-info'}
                size="sm"
                onClick={() => setFiltreActif('en-cours')}
              >
                <i className="bi bi-truck me-1"></i>
                En cours ({livraisonsEnCours.length})
              </Button>
              
              <Button
                variant={filtreActif === 'terminees' ? 'success' : 'outline-success'}
                size="sm"
                onClick={() => setFiltreActif('terminees')}
              >
                <i className="bi bi-check-circle me-1"></i>
                Terminées ({livraisonsTerminees.length})
              </Button>
              
              {livraisonsAnnulees.length > 0 && (
                <Button
                  variant={filtreActif === 'annulees' ? 'danger' : 'outline-danger'}
                  size="sm"
                  onClick={() => setFiltreActif('annulees')}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Annulées ({livraisonsAnnulees.length})
                </Button>
              )}
            </div>
          </div>
        </Card>

        {livraisonsLoading ? (
          <div className="text-center py-5">
            <Loading />
          </div>
        ) : (
          <>
            {filtreActif === 'tous' && livraisons && livraisons.length > 0 ? (
              <div>
                {/* Affichage groupé quand "Tous" est sélectionné */}
                {livraisonsACommencer.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-warning mb-3">
                      <i className="bi bi-clock me-2"></i>
                      À commencer ({livraisonsACommencer.length})
                    </h5>
                    <div className="row g-4">
                      {livraisonsACommencer.map((livraison) => (
                        <div key={livraison.id} className="col-lg-6">
                          <LivraisonCard
                            livraison={livraison}
                            onConsulter={handleConsulterLivraison}
                            onCommencer={() => {}} // Pas d'action côté client
                            peutCommencer={false} // Client ne peut pas commencer
                            messageAttente=""
                            isClientView={true} // Masquer les actions côté client
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {livraisonsEnCours.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-info mb-3">
                      <i className="bi bi-truck me-2"></i>
                      En cours ({livraisonsEnCours.length})
                    </h5>
                    <div className="row g-4">
                      {livraisonsEnCours.map((livraison) => (
                        <div key={livraison.id} className="col-lg-6">
                          <LivraisonCard
                            livraison={livraison}
                            onConsulter={handleConsulterLivraison}
                            onCommencer={() => {}}
                            peutCommencer={false}
                            messageAttente=""
                            isClientView={true} // Masquer les actions côté client
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {livraisonsTerminees.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-success mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      Terminées ({livraisonsTerminees.length})
                    </h5>
                    <div className="row g-4">
                      {livraisonsTerminees.map((livraison) => (
                        <div key={livraison.id} className="col-lg-6">
                          <LivraisonCard
                            livraison={livraison}
                            onConsulter={handleConsulterLivraison}
                            onCommencer={() => {}}
                            peutCommencer={false}
                            messageAttente=""
                            isClientView={true} // Masquer les actions côté client
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {livraisonsAnnulees.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-danger mb-3">
                      <i className="bi bi-x-circle me-2"></i>
                      Annulées ({livraisonsAnnulees.length})
                    </h5>
                    <div className="row g-4">
                      {livraisonsAnnulees.map((livraison) => (
                        <div key={livraison.id} className="col-lg-6">
                          <LivraisonCard
                            livraison={livraison}
                            onConsulter={handleConsulterLivraison}
                            onCommencer={() => {}}
                            peutCommencer={false}
                            messageAttente=""
                            isClientView={true} // Masquer les actions côté client
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : livraisonsFiltrees.length > 0 ? (
              <div className="row g-4">
                {livraisonsFiltrees.map((livraison) => (
                  <div key={livraison.id} className="col-lg-6">
                    <LivraisonCard
                      livraison={livraison}
                      onConsulter={handleConsulterLivraison}
                      onCommencer={() => {}}
                      peutCommencer={false}
                      messageAttente=""
                      isClientView={true} // Masquer les actions côté client
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-5">
                  <i className="bi bi-truck" style={{fontSize: '4rem', color: '#6c757d'}}></i>
                  <h5 className="mt-3 text-muted">
                    {filtreActif === 'tous' 
                      ? 'Aucune livraison en cours'
                      : `Aucune livraison ${filtreActif === 'a-commencer' ? 'à commencer' : 
                                           filtreActif === 'en-cours' ? 'en cours' :
                                           filtreActif === 'terminees' ? 'terminée' : 'annulée'}`
                    }
                  </h5>
                  <p className="text-muted mb-4">
                    {filtreActif === 'tous' 
                      ? 'Aucune de vos annonces n\'a encore été prise en charge par un livreur.'
                      : 'Aucune livraison dans cette catégorie.'
                    }
                  </p>
                  {filtreActif === 'tous' && (
                    <Button variant="primary" onClick={() => setActiveTab('annonces')}>
                      <i className="bi bi-megaphone me-2"></i>
                      Voir mes annonces
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  const renderReservations = () => {
    // Grouper les prestations par statut
    const prestationsReservees = prestations?.filter(p => p.statut === 'RESERVEE') || [];
    const prestationsEnCours = prestations?.filter(p => p.statut === 'EN_COURS') || [];
    const prestationsTerminees = prestations?.filter(p => p.statut === 'TERMINEE') || [];
    const prestationsAnnulees = prestations?.filter(p => p.statut === 'ANNULEE') || [];

    // Fonction pour filtrer les prestations selon le filtre actif
    const getPrestationsFiltrees = () => {
      switch (filtrePrestations) {
        case 'reservees':
          return prestationsReservees;
        case 'en-cours':
          return prestationsEnCours;
        case 'terminees':
          return prestationsTerminees;
        case 'annulees':
          return prestationsAnnulees;
        default:
          return prestations || [];
      }
    };

    const prestationsFiltrees = getPrestationsFiltrees();

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Mes réservations de prestations</h4>
          <Button variant="secondary" onClick={() => window.location.href = '/annonces'}>
            <i className="bi bi-search me-2"></i>
            Rechercher des services
          </Button>
        </div>

        {/* Filtres pour les prestations */}
        <Card className="mb-4">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant={filtrePrestations === 'toutes' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setFiltrePrestations('toutes')}
              >
                <i className="bi bi-list me-1"></i>
                Toutes ({prestations?.length || 0})
              </Button>
              
              <Button
                variant={filtrePrestations === 'reservees' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setFiltrePrestations('reservees')}
              >
                <i className="bi bi-calendar-check me-1"></i>
                Réservées ({prestationsReservees.length})
              </Button>
              
              <Button
                variant={filtrePrestations === 'en-cours' ? 'warning' : 'outline-warning'}
                size="sm"
                onClick={() => setFiltrePrestations('en-cours')}
              >
                <i className="bi bi-clock me-1"></i>
                En cours ({prestationsEnCours.length})
              </Button>
              
              <Button
                variant={filtrePrestations === 'terminees' ? 'success' : 'outline-success'}
                size="sm"
                onClick={() => setFiltrePrestations('terminees')}
              >
                <i className="bi bi-check-circle me-1"></i>
                Terminées ({prestationsTerminees.length})
              </Button>
              
              {prestationsAnnulees.length > 0 && (
                <Button
                  variant={filtrePrestations === 'annulees' ? 'danger' : 'outline-danger'}
                  size="sm"
                  onClick={() => setFiltrePrestations('annulees')}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Annulées ({prestationsAnnulees.length})
                </Button>
              )}
            </div>
          </div>
        </Card>

        {prestationsLoading ? (
          <div className="text-center py-5">
            <Loading />
          </div>
        ) : (
          <>
            {filtrePrestations === 'toutes' && prestations && prestations.length > 0 ? (
              <div>
                {/* Affichage groupé quand "Toutes" est sélectionné */}
                {prestationsReservees.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-calendar-check me-2"></i>
                      Réservées ({prestationsReservees.length})
                    </h5>
                    <div className="row g-4">
                      {prestationsReservees.map((prestation) => (
                        <div key={prestation.id} className="col-lg-6">
                          <PrestationCard
                            prestation={prestation}
                            currentUser={currentUser!.user}
                            onEvaluationSubmitted={handleEvaluationSubmitted}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prestationsEnCours.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-warning mb-3">
                      <i className="bi bi-clock me-2"></i>
                      En cours ({prestationsEnCours.length})
                    </h5>
                    <div className="row g-4">
                      {prestationsEnCours.map((prestation) => (
                        <div key={prestation.id} className="col-lg-6">
                          <PrestationCard
                            prestation={prestation}
                            currentUser={currentUser!.user}
                            onEvaluationSubmitted={handleEvaluationSubmitted}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prestationsTerminees.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-success mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      Terminées ({prestationsTerminees.length})
                    </h5>
                    <div className="row g-4">
                      {prestationsTerminees.map((prestation) => (
                        <div key={prestation.id} className="col-lg-6">
                          <PrestationCard
                            prestation={prestation}
                            currentUser={currentUser!.user}
                            onEvaluationSubmitted={handleEvaluationSubmitted}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prestationsAnnulees.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-danger mb-3">
                      <i className="bi bi-x-circle me-2"></i>
                      Annulées ({prestationsAnnulees.length})
                    </h5>
                    <div className="row g-4">
                      {prestationsAnnulees.map((prestation) => (
                        <div key={prestation.id} className="col-lg-6">
                          <PrestationCard
                            prestation={prestation}
                            currentUser={currentUser!.user}
                            onEvaluationSubmitted={handleEvaluationSubmitted}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : prestationsFiltrees.length > 0 ? (
              <div className="row g-4">
                {prestationsFiltrees.map((prestation) => (
                  <div key={prestation.id} className="col-lg-6">
                    <PrestationCard
                      prestation={prestation}
                      currentUser={currentUser!.user}
                      onEvaluationSubmitted={handleEvaluationSubmitted}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-5">
                  <i className="bi bi-calendar-check" style={{fontSize: '4rem', color: '#6c757d'}}></i>
                  <h5 className="mt-3 text-muted">
                    {filtrePrestations === 'toutes' 
                      ? 'Aucune réservation trouvée'
                      : `Aucune prestation ${filtrePrestations === 'reservees' ? 'réservée' : 
                                            filtrePrestations === 'en-cours' ? 'en cours' :
                                            filtrePrestations === 'terminees' ? 'terminée' : 'annulée'}`
                    }
                  </h5>
                  <p className="text-muted mb-4">
                    {filtrePrestations === 'toutes' 
                      ? 'Vous n\'avez pas encore réservé de prestation. Découvrez nos services !'
                      : 'Aucune prestation dans cette catégorie.'
                    }
                  </p>
                  {filtrePrestations === 'toutes' && (
                    <Button variant="primary" onClick={() => window.location.href = '/annonces'}>
                      <i className="bi bi-search me-2"></i>
                      Rechercher des services
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  const renderPaiements = () => (
    <Card title="Mes paiements">
      <div className="text-center py-5">
        <i className="bi bi-credit-card" style={{fontSize: '3rem', color: '#6c757d'}}></i>
        <p className="mt-3 text-muted">Système de paiement en cours de développement</p>
        <p className="text-muted small">
          Cette section permettra de gérer vos moyens de paiement 
          et l'historique de vos transactions.
        </p>
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
      case 'livraisons':
        return renderLivraisons();
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

      {/* Modal de détails de livraison (côté client = lecture seule) */}
      <LivraisonDetailModal
        isOpen={showLivraisonModal}
        onClose={handleCloseLivraisonModal}
        livraison={selectedLivraison}
        onLivraisonUpdated={handleLivraisonUpdated}
      />
    </>
  );
};

export default ClientDashboard;
