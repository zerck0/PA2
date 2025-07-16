import React, { useState, useEffect } from 'react';
import { annonceService, userService } from '../services/api';
import type { Annonce, AnnonceCommercant, User } from '../types';

const AnnoncesPage: React.FC = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [annoncesCommercant, setAnnoncesCommercant] = useState<AnnonceCommercant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allAnnonces, allAnnoncesCommercant, allUsers] = await Promise.all([
        annonceService.getAllAnnonces(),
        annonceService.getAllAnnoncesCommercant(),
        userService.getAllUsers()
      ]);
      setAnnonces(allAnnonces);
      setAnnoncesCommercant(allAnnoncesCommercant);
      setUsers(allUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (userId: number) => {
    return users.find(u => u.id === userId);
  };

  const handleDeleteAnnonce = async (id: number, type: 'CLIENT' | 'COMMERCANT') => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      setDeletingId(id);
      
      if (type === 'CLIENT') {
        await annonceService.deleteAnnonce(id);
      } else {
        await annonceService.deleteAnnonceCommercant(id);
      }
      
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'LIVRAISON': return 'bg-primary';
      case 'COURSES': return 'bg-success';
      case 'DEMENAGEMENT': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const filteredAnnonces = typeFilter === 'ALL' || typeFilter === 'CLIENT' ? annonces : [];
  const filteredAnnoncesCommercant = typeFilter === 'ALL' || typeFilter === 'COMMERCANT' ? annoncesCommercant : [];
  const totalCount = filteredAnnonces.length + filteredAnnoncesCommercant.length;

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
          <h1 className="h3 mb-0">Gestion des annonces</h1>
          <p className="text-muted mb-0">Modération et administration des annonces</p>
        </div>
        <div>
          <span className="badge bg-primary fs-6">{totalCount} annonce(s)</span>
        </div>
      </div>

      <div className="table-container mb-4">
        <div className="p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">Toutes les annonces</option>
                <option value="CLIENT">Annonces clients</option>
                <option value="COMMERCANT">Annonces commerçants</option>
              </select>
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
                <th>Annonce</th>
                <th>Auteur</th>
                <th>Type</th>
                <th>Prix</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {totalCount === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    Aucune annonce trouvée
                  </td>
                </tr>
              ) : (
                <>
                  {filteredAnnonces.map((annonce) => {
                    const user = getUserInfo(annonce.auteur?.id || 0);
                    return (
                      <tr key={`client-${annonce.id}`}>
                        <td>
                          <div>
                            <div className="fw-bold">{annonce.titre}</div>
                            <small className="text-muted">
                              {annonce.villeDepart} → {annonce.villeArrivee}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-bold">
                              {user ? `${user.prenom} ${user.nom}` : 'Utilisateur inconnu'}
                            </div>
                            <small className="text-muted">Client</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getTypeBadgeClass(annonce.type)}`}>
                            {annonce.type}
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold">{annonce.prixPropose}€</span>
                        </td>
                        <td>
                          {annonce.dateCreation ? (
                            new Date(annonce.dateCreation).toLocaleDateString('fr-FR')
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteAnnonce(annonce.id, 'CLIENT')}
                            disabled={deletingId === annonce.id}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAnnoncesCommercant.map((annonce) => {
                    const user = getUserInfo(annonce.commercant?.id || 0);
                    return (
                      <tr key={`commercant-${annonce.id}`}>
                        <td>
                          <div>
                            <div className="fw-bold">{annonce.titre}</div>
                            <small className="text-muted">{annonce.description}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-bold">
                              {user ? `${user.prenom} ${user.nom}` : 'Commerçant inconnu'}
                            </div>
                            <small className="text-muted">Commerçant</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">COMMERCIAL</span>
                        </td>
                        <td>
                          <span className="fw-bold">{annonce.prix}€</span>
                        </td>
                        <td>
                          {annonce.dateCreation ? (
                            new Date(annonce.dateCreation).toLocaleDateString('fr-FR')
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteAnnonce(annonce.id, 'COMMERCANT')}
                            disabled={deletingId === annonce.id}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnnoncesPage;
