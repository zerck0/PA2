import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import type { User, UserFilters } from '../types';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await userService.getAllUsers(filters);
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'CLIENT': return 'bg-primary';
      case 'LIVREUR': return 'bg-success';
      case 'COMMERCANT': return 'bg-warning';
      case 'PRESTATAIRE': return 'bg-info';
      case 'ADMIN': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'VALIDE': return 'badge-valide';
      case 'EN_ATTENTE': return 'badge-en-attente';
      case 'NON_VERIFIE': return 'badge-en-attente';
      case 'REFUSE': return 'badge-refuse';
      case 'SUSPENDU': return 'badge-refuse';
      default: return 'bg-secondary';
    }
  };

  const handleUserAction = async (userId: number, action: 'suspend' | 'activate' | 'delete') => {
    if (action === 'delete' && !confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      setActionLoading(userId);
      
      switch (action) {
        case 'suspend':
          await userService.suspendUser(userId);
          break;
        case 'activate':
          await userService.activateUser(userId);
          break;
        case 'delete':
          await userService.deleteUser(userId);
          break;
      }
      
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'action');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        user.nom.toLowerCase().includes(searchTerm) ||
        user.prenom.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Gestion des utilisateurs</h1>
          <p className="text-muted mb-0">Administration des comptes utilisateurs</p>
        </div>
        <div>
          <span className="badge bg-primary fs-6">{filteredUsers.length} utilisateur(s)</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="table-container mb-4">
        <div className="p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Recherche</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nom, prénom ou email..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Rôle</label>
              <select
                className="form-select"
                value={filters.role || ''}
                onChange={(e) => setFilters({ ...filters, role: e.target.value || undefined })}
              >
                <option value="">Tous les rôles</option>
                <option value="CLIENT">Client</option>
                <option value="LIVREUR">Livreur</option>
                <option value="COMMERCANT">Commerçant</option>
                <option value="PRESTATAIRE">Prestataire</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Statut</label>
              <select
                className="form-select"
                value={filters.statut || ''}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value || undefined })}
              >
                <option value="">Tous les statuts</option>
                <option value="VALIDE">Validé</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="NON_VERIFIE">Non vérifié</option>
                <option value="SUSPENDU">Suspendu</option>
                <option value="REFUSE">Refusé</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({})}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-placeholder bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                             style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-person text-muted"></i>
                        </div>
                        <div>
                          <div className="fw-bold">{user.prenom} {user.nom}</div>
                          <small className="text-muted">ID: {user.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span>{user.email}</span>
                      {user.telephone && (
                        <div>
                          <small className="text-muted">
                            <i className="bi bi-telephone me-1"></i>
                            {user.telephone}
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatutBadgeClass(user.statut)}`}>
                        {user.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {user.dateCreation ? (
                        new Date(user.dateCreation).toLocaleDateString('fr-FR')
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {user.statut === 'SUSPENDU' ? (
                          <button 
                            className="btn btn-outline-success btn-action"
                            onClick={() => handleUserAction(user.id, 'activate')}
                            disabled={actionLoading === user.id}
                            title="Réactiver"
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                        ) : user.role !== 'ADMIN' && (
                          <button 
                            className="btn btn-outline-warning btn-action"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            disabled={actionLoading === user.id}
                            title="Suspendre"
                          >
                            <i className="bi bi-pause-circle"></i>
                          </button>
                        )}
                        {user.role !== 'ADMIN' && (
                          <button 
                            className="btn btn-outline-danger btn-action"
                            onClick={() => handleUserAction(user.id, 'delete')}
                            disabled={actionLoading === user.id}
                            title="Supprimer"
                          >
                            {actionLoading === user.id ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            ) : (
                              <i className="bi bi-trash"></i>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques rapides */}
      {filteredUsers.length > 0 && (
        <div className="mt-4">
          <div className="row g-3">
            <div className="col-auto">
              <small className="text-muted">
                <strong>Total affiché:</strong> {filteredUsers.length} utilisateur(s)
              </small>
            </div>
            <div className="col-auto">
              <small className="text-muted">
                <strong>Clients:</strong> {filteredUsers.filter(u => u.role === 'CLIENT').length}
              </small>
            </div>
            <div className="col-auto">
              <small className="text-muted">
                <strong>Livreurs:</strong> {filteredUsers.filter(u => u.role === 'LIVREUR').length}
              </small>
            </div>
            <div className="col-auto">
              <small className="text-muted">
                <strong>Commerçants:</strong> {filteredUsers.filter(u => u.role === 'COMMERCANT').length}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
