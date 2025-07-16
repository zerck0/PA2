import React, { useState, useEffect } from 'react';
import { livraisonService, userService } from '../services/api';
import type { Livraison, User } from '../types';

const LivraisonsPage: React.FC = () => {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allLivraisons, allUsers, statsData] = await Promise.all([
        livraisonService.getAllLivraisons(),
        userService.getAllUsers(),
        livraisonService.getStats()
      ]);
      setLivraisons(allLivraisons);
      setUsers(allUsers);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (userId: number) => {
    return users.find(u => u.id === userId);
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-primary';
      case 'LIVREE': return 'bg-success';
      case 'STOCKEE': return 'bg-info';
      case 'ANNULEE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'COMPLETE': return 'bg-success';
      case 'PARTIELLE_DEPOT': return 'bg-warning';
      case 'PARTIELLE_RETRAIT': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Suivi des livraisons</h1>
          <p className="text-muted mb-0">Administration et suivi des livraisons en cours</p>
        </div>
        <div>
          <span className="badge bg-primary fs-6">{livraisons.length} livraison(s)</span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">En cours</h6>
                <h3 className="mb-0">{stats.livraisonsEnCours || 0}</h3>
              </div>
              <i className="bi bi-truck fs-2 text-primary"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Livrées</h6>
                <h3 className="mb-0">{stats.livraisonsLivrees || 0}</h3>
              </div>
              <i className="bi bi-check-circle fs-2 text-success"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Stockées</h6>
                <h3 className="mb-0">{stats.livraisonsStockees || 0}</h3>
              </div>
              <i className="bi bi-box fs-2 text-info"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Annulées</h6>
                <h3 className="mb-0">{stats.livraisonsAnnulees || 0}</h3>
              </div>
              <i className="bi bi-x-circle fs-2 text-danger"></i>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Livreur</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Prix</th>
                <th>Date création</th>
              </tr>
            </thead>
            <tbody>
              {livraisons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    Aucune livraison trouvée
                  </td>
                </tr>
              ) : (
                livraisons.map((livraison) => {
                  const livreur = getUserInfo(livraison.livreur?.id || 0);
                  return (
                    <tr key={livraison.id}>
                      <td>
                        <div>
                          <div className="fw-bold">{livraison.codeValidation}</div>
                          <small className="text-muted">ID: {livraison.id}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">
                            {livreur ? `${livreur.prenom} ${livreur.nom}` : 'Non assigné'}
                          </div>
                          <small className="text-muted">
                            {livreur ? livreur.email : '-'}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getTypeBadgeClass(livraison.typeLivraison)}`}>
                          {livraison.typeLivraison?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatutBadgeClass(livraison.statut)}`}>
                          {livraison.statut?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold">
                          {livraison.prixConvenu ? `${livraison.prixConvenu}€` : '-'}
                        </span>
                      </td>
                      <td>
                        {livraison.dateCreation ? (
                          new Date(livraison.dateCreation).toLocaleDateString('fr-FR')
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Résumé des types */}
      {livraisons.length > 0 && (
        <div className="mt-4">
          <div className="row g-3">
            <div className="col-auto">
              <small className="text-muted">
                <strong>Total:</strong> {livraisons.length} livraison(s)
              </small>
            </div>
            <div className="col-auto">
              <small className="text-muted">
                <strong>Complètes:</strong> {stats.livraisonsCompletes || 0}
              </small>
            </div>
            <div className="col-auto">
              <small className="text-muted">
                <strong>Partielles:</strong> {stats.livraisonsPartielles || 0}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivraisonsPage;
