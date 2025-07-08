import React, { useState, useEffect } from 'react';
import DashboardLayout from './shared/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import CreateAnnonceCommercantModal from '../../components/CreateAnnonceCommercantModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { AnnonceCommercant, ContratCommercant } from '../../types';
import { annonceCommercantApi, contratApi } from '../../services/api';

const CommercantDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [annonces, setAnnonces] = useState<AnnonceCommercant[]>([]);
  const [annoncesLoading, setAnnoncesLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [countAnnonces, setCountAnnonces] = useState(0);
  const [contrat, setContrat] = useState<ContratCommercant | null>(null);
  const [contratLoading, setContratLoading] = useState(false);
  const [hasContrat, setHasContrat] = useState(false);

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

  // Charger le contrat quand on accède à l'onglet contrat
  useEffect(() => {
    if (currentUser?.user.id && activeTab === 'contrat') {
      loadContrat();
    }
  }, [currentUser, activeTab]);

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

  const loadContrat = async () => {
    if (!currentUser?.user.id) return;
    
    setContratLoading(true);
    try {
      // Vérifier si le commerçant a un contrat
      const hasContratResult = await contratApi.hasContrat(currentUser.user.id);
      setHasContrat(hasContratResult);
      
      if (hasContratResult) {
        // Charger les détails du contrat
        const contratData = await contratApi.getByCommercant(currentUser.user.id);
        setContrat(contratData);
      } else {
        setContrat(null);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement du contrat:', error);
      if (error.response?.status === 404) {
        // Pas de contrat trouvé
        setHasContrat(false);
        setContrat(null);
      } else {
        showError('Erreur lors du chargement du contrat');
      }
    } finally {
      setContratLoading(false);
    }
  };

  const handleCreateAnnonce = async (annonceData: any) => {
    if (!currentUser?.user.id) return;

    try {
      // Convertir les dates au format LocalDateTime pour le backend
      const processedData = {
        ...annonceData,
        dateLimite: annonceData.dateLimite ? `${annonceData.dateLimite}T00:00:00` : null,
        datePreferee: annonceData.datePreferee ? `${annonceData.datePreferee}T00:00:00` : null
      };

      await annonceCommercantApi.create(processedData, currentUser.user.id);
      showSuccess('Annonce créée avec succès !');
      setShowCreateModal(false);
      loadAnnonces();
      loadCountAnnonces();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      showError('Erreur lors de la création de l\'annonce : ' + (error.response?.data || error.message));
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

  const renderContrat = () => {
    if (contratLoading) {
      return (
        <Card title="Mon contrat EcoDeli">
          <div className="text-center py-5">
            <Loading />
            <p className="mt-3 text-muted">Chargement du contrat...</p>
          </div>
        </Card>
      );
    }

    if (!hasContrat) {
      return (
        <Card title="Mon contrat EcoDeli">
          <div className="text-center py-5">
            <i className="bi bi-exclamation-triangle" style={{fontSize: '3rem', color: '#ffc107'}}></i>
            <h5 className="mt-3 text-warning">Aucun contrat établi</h5>
            <p className="text-muted mb-4">
              Vous devez établir un contrat avec EcoDeli pour commencer à utiliser nos services.
            </p>
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Prochaines étapes :</strong>
              <ul className="mb-0 mt-2 text-start">
                <li>Contactez notre équipe commerciale</li>
                <li>Finalisation des conditions tarifaires</li>
                <li>Signature du contrat de partenariat</li>
                <li>Activation de votre compte commerçant</li>
              </ul>
            </div>
            <Button variant="primary" className="me-2">
              <i className="bi bi-envelope me-2"></i>
              Contacter le service commercial
            </Button>
            <Button variant="outline-secondary">
              <i className="bi bi-telephone me-2"></i>
              Planifier un rendez-vous
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Mon contrat EcoDeli</h4>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm">
              <i className="bi bi-download me-2"></i>
              Télécharger le PDF
            </Button>
            <Button variant="outline-secondary" size="sm">
              <i className="bi bi-printer me-2"></i>
              Imprimer
            </Button>
          </div>
        </div>

        <div className="row g-4">
          {/* Visualiseur PDF */}
          <div className="col-lg-8">
            <Card title="Document contractuel">
              <div style={{ height: '600px', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                <iframe
                  src="/contrat-exemple.pdf"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="Contrat EcoDeli"
                >
                  <p>
                    Votre navigateur ne peut pas afficher ce PDF. 
                    <a href="/contrat-exemple.pdf" target="_blank" rel="noopener noreferrer">
                      Téléchargez-le ici
                    </a>
                  </p>
                </iframe>
              </div>
            </Card>
          </div>

          {/* Informations du contrat */}
          <div className="col-lg-4">
            {/* Informations générales */}
            <Card title="📋 Informations générales" className="mb-4">
              <div className="mb-3">
                <label className="small text-muted">Numéro de contrat</label>
                <div className="fw-bold">{contrat?.numeroContrat}</div>
              </div>
              <div className="mb-3">
                <label className="small text-muted">Statut</label>
                <div>
                  <span className={`badge ${
                    contrat?.statutContrat === 'ACTIF' ? 'bg-success' :
                    contrat?.statutContrat === 'EXPIRE' ? 'bg-danger' :
                    contrat?.statutContrat === 'SUSPENDU' ? 'bg-warning' :
                    'bg-secondary'
                  }`}>
                    {contrat?.statutContrat}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <label className="small text-muted">Date de signature</label>
                <div>{contrat?.dateSignature ? new Date(contrat.dateSignature).toLocaleDateString('fr-FR') : '-'}</div>
              </div>
              <div className="mb-3">
                <label className="small text-muted">Date de début</label>
                <div>{contrat?.dateDebut ? new Date(contrat.dateDebut).toLocaleDateString('fr-FR') : '-'}</div>
              </div>
              {contrat?.dateFin && (
                <div className="mb-3">
                  <label className="small text-muted">Date de fin</label>
                  <div>{new Date(contrat.dateFin).toLocaleDateString('fr-FR')}</div>
                </div>
              )}
            </Card>

            {/* Conditions tarifaires */}
            <Card title="💰 Conditions tarifaires" className="mb-4">
              {contrat?.commissionPourcentage && (
                <div className="mb-3">
                  <label className="small text-muted">Commission</label>
                  <div className="fw-bold text-primary">{contrat.commissionPourcentage}%</div>
                </div>
              )}
              {contrat?.fraisInscription && (
                <div className="mb-3">
                  <label className="small text-muted">Frais d'inscription</label>
                  <div>{contrat.fraisInscription}€</div>
                </div>
              )}
              {contrat?.abonnementMensuel && (
                <div className="mb-3">
                  <label className="small text-muted">Abonnement mensuel</label>
                  <div>{contrat.abonnementMensuel}€/mois</div>
                </div>
              )}
            </Card>

            {/* Services inclus */}
            <Card title="🔧 Services inclus">
              <div className="d-flex flex-wrap gap-2">
                {contrat?.livraisonRapideIncluse && (
                  <span className="badge bg-success">
                    <i className="bi bi-lightning me-1"></i>
                    Livraison rapide
                  </span>
                )}
                {contrat?.assuranceIncluse && (
                  <span className="badge bg-primary">
                    <i className="bi bi-shield-check me-1"></i>
                    Assurance
                  </span>
                )}
                {contrat?.supportPrioritaire && (
                  <span className="badge bg-warning">
                    <i className="bi bi-headset me-1"></i>
                    Support prioritaire
                  </span>
                )}
                {contrat?.nombreLivraisonsMensuelles && (
                  <span className="badge bg-info">
                    <i className="bi bi-box me-1"></i>
                    {contrat.nombreLivraisonsMensuelles} livraisons/mois
                  </span>
                )}
              </div>
              {!contrat?.livraisonRapideIncluse && !contrat?.assuranceIncluse && !contrat?.supportPrioritaire && (
                <p className="text-muted small mb-0">Contrat de base</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  };

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
