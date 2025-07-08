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
import { annonceApi, annonceCommercantApi } from '../services/api';
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

  useEffect(() => {
    if (activeTab === 'annonces') {
      loadAnnonces();
    } else if (activeTab === 'missions' && isLivreurAffilie()) {
      loadAnnoncesCommercant();
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
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Annonces de livraison</h2>
        {currentUser && (
          <Link to="/dashboard">
            <Button variant="primary">Créer une annonce</Button>
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

      {/* Contenu selon l'onglet actif */}
      {renderContent()}
    </Layout>
  );
};

export default Annonces;
