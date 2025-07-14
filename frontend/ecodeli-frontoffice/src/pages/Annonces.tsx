import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AnnonceCard from '../components/AnnonceCard';
import AnnonceCommercantCard from '../components/AnnonceCommercantCard';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { annonceApi, annonceCommercantApi, prestationApi } from '../services/api';
import { Annonce, AnnonceCommercant } from '../types';

const Annonces: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('annonces');
  const [filter, setFilter] = useState('');
  
  // API pour les annonces normales
  const { 
    data: annonces, 
    loading, 
    error, 
    execute: loadAnnonces 
  } = useApi<Annonce[]>(annonceApi.getAll);

  // API pour les annonces commerçant (pour livreurs affiliés)
  const { 
    data: annoncesCommercant, 
    loading: loadingCommercant, 
    error: errorCommercant, 
    execute: loadAnnoncesCommercant 
  } = useApi<AnnonceCommercant[]>(() => annonceCommercantApi.getForAffiliatedDeliverers());

  // API pour les prestations disponibles
  const { 
    data: prestations, 
    loading: loadingPrestations, 
    error: errorPrestations, 
    execute: loadPrestations 
  } = useApi<any[]>(() => prestationApi.getDisponibles());

  useEffect(() => {
    if (activeTab === 'annonces') {
      loadAnnonces();
    } else if (activeTab === 'missions' && isLivreurAffilie()) {
      loadAnnoncesCommercant();
    } else if (activeTab === 'prestations') {
      loadPrestations();
    }
  }, [activeTab]);

  // Vérifier si l'utilisateur est un livreur affilié
  const isLivreurAffilie = () => {
    return currentUser?.user.role === 'LIVREUR' && 
           currentUser?.user.statutAffiliation === 'AFFILIE';
  };

  const handleContact = (annonceId: number) => {
    alert(`Contacter l'annonce ${annonceId} - Fonctionnalité à implémenter`);
  };

  // Nouvelle fonction : Prendre en charge une mission commerçant
  const handlePrendreEnCharge = async (annonceId: number) => {
    try {
      await annonceCommercantApi.prendreEnCharge(annonceId, currentUser!.user.id);
      showSuccess('Mission prise en charge avec succès ! Elle apparaît maintenant dans votre dashboard.');
      loadAnnoncesCommercant(); // Recharger la liste
    } catch (error: any) {
      showError('Erreur lors de la prise en charge : ' + (error.response?.data || error.message));
    }
  };

  // Filtres pour les annonces normales
  const filteredAnnonces = annonces?.filter(annonce =>
    annonce.titre.toLowerCase().includes(filter.toLowerCase()) ||
    annonce.villeDepart.toLowerCase().includes(filter.toLowerCase()) ||
    annonce.villeArrivee.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  // Filtres pour les annonces commerçant
  const filteredAnnoncesCommercant = annoncesCommercant?.filter(annonce =>
    annonce.titre.toLowerCase().includes(filter.toLowerCase()) ||
    annonce.villeDepart.toLowerCase().includes(filter.toLowerCase()) ||
    annonce.villeArrivee.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  // Filtres pour les prestations
  const filteredPrestations = prestations?.filter(prestation =>
    prestation.description.toLowerCase().includes(filter.toLowerCase()) ||
    prestation.typeService.toLowerCase().includes(filter.toLowerCase()) ||
    prestation.prestataireName.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  // Fonction pour réserver une prestation
  const handleReserverPrestation = (prestationId: number) => {
    if (!currentUser) {
      showError('Vous devez être connecté pour réserver une prestation');
      return;
    }
    // TODO: Ouvrir une modal de réservation
    alert(`Réserver la prestation ${prestationId} - Modal à implémenter`);
  };

  // Rendu conditionnel selon l'onglet actif
  const renderContent = () => {
    if (activeTab === 'annonces') {
      // Onglet Annonces normales (existant)
      return (
        <div>
          {loading ? (
            <Loading text="Chargement des annonces..." />
          ) : (
            <div>
              {filteredAnnonces.length > 0 ? (
                filteredAnnonces.map((annonce) => (
                  <AnnonceCard
                    key={annonce.id}
                    annonce={annonce}
                    onContact={currentUser ? handleContact : undefined}
                  />
                ))
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune annonce trouvée.</p>
                  {currentUser && (
                    <Link to="/dashboard">
                      <Button variant="primary">Créer la première annonce</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else if (activeTab === 'missions') {
      // Onglet Missions Commerçant (nouveau)
      return (
        <div>
          {loadingCommercant ? (
            <Loading text="Chargement des missions commerçant..." />
          ) : (
            <div>
              {filteredAnnoncesCommercant.length > 0 ? (
                filteredAnnoncesCommercant.map((annonce) => (
                  <AnnonceCommercantCard
                    key={annonce.id}
                    annonce={annonce}
                    onPrendreEnCharge={handlePrendreEnCharge}
                  />
                ))
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-shop" style={{fontSize: '3rem', color: '#6c757d'}}></i>
                  <h5 className="mt-3 text-muted">Aucune mission commerçant disponible</h5>
                  <p className="text-muted">
                    Les missions pour livreurs affiliés EcoDeli apparaîtront ici.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else if (activeTab === 'prestations') {
      // Onglet Prestations disponibles (nouveau)
      return (
        <div>
          {loadingPrestations ? (
            <Loading text="Chargement des prestations..." />
          ) : (
            <div>
              {filteredPrestations.length > 0 ? (
                filteredPrestations.map((prestation) => (
                  <div key={prestation.id} className="card mb-3">
                    <div className="card-body">
                      <div className="row align-items-center">
                        {/* Photo de la prestation ou du prestataire */}
                        <div className="col-md-2 text-center">
                          <img
                            src={prestation.photoPrestation || prestation.prestatairePhoto || '/api/placeholder/80/80'}
                            alt={prestation.typeService}
                            className="rounded"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjhmOWZhIi8+CjxwYXRoIGQ9Ik00MCA1NkM0OC44MzY2IDU2IDU2IDQ4LjgzNjYgNTYgNDBDNTYgMzEuMTYzNCA0OC44MzY2IDI0IDQwIDI0QzMxLjE2MzQgMjQgMjQgMzEuMTYzNCAyNCA0MEMyNCA0OC44MzY2IDMxLjE2MzQgNTYgNDAgNTZaIiBmaWxsPSIjZGRkZGRkIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                        </div>

                        {/* Informations de la prestation */}
                        <div className="col-md-7">
                          <div className="d-flex align-items-center mb-2">
                            <h5 className="mb-0 me-2">{prestation.typeService}</h5>
                            <span className="badge bg-success">{prestation.typeServiceCode}</span>
                          </div>
                          <p className="text-muted mb-2">{prestation.description}</p>
                          
                          {/* Informations du prestataire */}
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              {prestation.prestatairePhoto ? (
                                <img
                                  src={prestation.prestatairePhoto}
                                  alt={prestation.prestataireName}
                                  className="rounded-circle me-2"
                                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div 
                                  className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center me-2"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <i className="bi bi-person-fill text-white" style={{ fontSize: '16px' }}></i>
                                </div>
                              )}
                              <span className="fw-medium">{prestation.prestataireName}</span>
                            </div>
                            
                            {/* Note moyenne (TODO: intégrer avec les vraies évaluations) */}
                            <div className="d-flex align-items-center text-muted">
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              <span>{prestation.noteMoyenne || 'Nouveau'} ({prestation.nombreEvaluations || 0})</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-md-3 text-end">
                          <div className="d-flex flex-column gap-2">
                            {/* Bouton pour voir le profil du prestataire */}
                            <Button
                              variant="outline-secondary"
                              onClick={() => window.open(`/profil-public/prestataire/${prestation.prestataireId}`, '_blank')}
                              className="btn-sm"
                            >
                              <i className="bi bi-person me-1"></i>
                              Voir profil
                            </Button>
                            
                            {/* Bouton de réservation */}
                            {currentUser && (
                              <Button
                                variant="primary"
                                onClick={() => handleReserverPrestation(prestation.prestataireId)}
                                className="btn-sm"
                              >
                                <i className="bi bi-calendar-check me-1"></i>
                                Réserver
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-tools" style={{fontSize: '3rem', color: '#6c757d'}}></i>
                  <h5 className="mt-3 text-muted">Aucune prestation disponible</h5>
                  <p className="text-muted">
                    Les prestataires qui ont configuré leur profil apparaîtront ici.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          {activeTab === 'prestations' ? 'Prestations disponibles' : 
           activeTab === 'missions' ? 'Missions commerçant' : 
           'Annonces de livraison'}
        </h2>
        {currentUser && (
          <Link to="/dashboard">
            <Button variant="primary">
              {activeTab === 'prestations' ? 'Devenir prestataire' : 'Créer une annonce'}
            </Button>
          </Link>
        )}
      </div>

      {/* Onglets - Simple système de navigation */}
      <div className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'annonces' ? 'active' : ''}`}
              onClick={() => setActiveTab('annonces')}
            >
              <i className="bi bi-megaphone me-2"></i>
              Annonces de clients
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'prestations' ? 'active' : ''}`}
              onClick={() => setActiveTab('prestations')}
            >
              <i className="bi bi-tools me-2"></i>
              Prestations disponibles
            </button>
          </li>
          {/* Afficher l'onglet missions uniquement pour les livreurs affiliés */}
          {isLivreurAffilie() && (
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'missions' ? 'active' : ''}`}
                onClick={() => setActiveTab('missions')}
              >
                <i className="bi bi-shop me-2"></i>
                Missions Commerçant
                <span className="badge bg-primary ms-2">Affiliés EcoDeli</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Recherche simple - fonctionne pour les deux onglets */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par titre ou ville..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <Alert type="danger" className="mb-4">
          Erreur lors du chargement des annonces: {error}
        </Alert>
      )}

      {errorCommercant && activeTab === 'missions' && (
        <Alert type="danger" className="mb-4">
          Erreur lors du chargement des missions commerçant: {errorCommercant}
        </Alert>
      )}

      {errorPrestations && activeTab === 'prestations' && (
        <Alert type="danger" className="mb-4">
          Erreur lors du chargement des prestations: {errorPrestations}
        </Alert>
      )}

      {/* Contenu selon l'onglet actif */}
      {renderContent()}
    </Layout>
  );
};

export default Annonces;
