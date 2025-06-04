import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AnnonceCard from '../components/AnnonceCard';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { annonceApi } from '../services/api';
import { Annonce } from '../types';

const Annonces: React.FC = () => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState('');
  
  const { 
    data: annonces, 
    loading, 
    error, 
    execute: loadAnnonces 
  } = useApi<Annonce[]>(annonceApi.getAll);

  useEffect(() => {
    loadAnnonces();
  }, []);

  const handleContact = (annonceId: number) => {
    // Logique simple de contact
    alert(`Contacter l'annonce ${annonceId} - Fonctionnalité à implémenter`);
  };

  const filteredAnnonces = annonces?.filter(annonce =>
    annonce.titre.toLowerCase().includes(filter.toLowerCase()) ||
    annonce.villeDepart.toLowerCase().includes(filter.toLowerCase()) ||
    annonce.villeArrivee.toLowerCase().includes(filter.toLowerCase())
  ) || [];

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

      {/* Recherche simple */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par titre ou ville..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {error && (
        <Alert type="danger" className="mb-4">
          Erreur lors du chargement des annonces: {error}
        </Alert>
      )}

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
    </Layout>
  );
};

export default Annonces;
