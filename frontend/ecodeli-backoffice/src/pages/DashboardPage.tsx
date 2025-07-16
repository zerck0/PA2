import React, { useState, useEffect } from 'react';
import { statsService } from '../services/api';
import type { DashboardStats } from '../types';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const dashboardStats = await statsService.getDashboardStats();
        setStats(dashboardStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Dashboard</h1>
          <p className="text-muted mb-0">Vue d'ensemble de l'activité EcoDéli</p>
        </div>
        <div className="text-end">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            Mis à jour: {new Date().toLocaleString('fr-FR')}
          </small>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <i className="bi bi-people fs-2 text-ecodeli"></i>
              </div>
              <div className="flex-grow-1 ms-3">
                <div className="fw-bold fs-4">{stats?.totalUtilisateurs || 0}</div>
                <div className="text-muted">Utilisateurs</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-warning">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <i className="bi bi-file-earmark-check fs-2 text-warning"></i>
              </div>
              <div className="flex-grow-1 ms-3">
                <div className="fw-bold fs-4">{stats?.documentsEnAttente || 0}</div>
                <div className="text-muted">Documents en attente</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-info">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <i className="bi bi-megaphone fs-2 text-info"></i>
              </div>
              <div className="flex-grow-1 ms-3">
                <div className="fw-bold fs-4">{stats?.annonceActives || 0}</div>
                <div className="text-muted">Annonces actives</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-danger">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <i className="bi bi-truck fs-2 text-danger"></i>
              </div>
              <div className="flex-grow-1 ms-3">
                <div className="fw-bold fs-4">{stats?.livraisonsEnCours || 0}</div>
                <div className="text-muted">Livraisons en cours</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par type d'utilisateur */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="table-container">
            <div className="p-3 border-bottom">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Répartition des utilisateurs
              </h5>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <div>
                      <i className="bi bi-person me-2 text-primary"></i>
                      <strong>Clients</strong>
                    </div>
                    <span className="badge bg-primary">{stats?.totalClients || 0}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <div>
                      <i className="bi bi-truck me-2 text-success"></i>
                      <strong>Livreurs</strong>
                    </div>
                    <span className="badge bg-success">{stats?.totalLivreurs || 0}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <div>
                      <i className="bi bi-shop me-2 text-warning"></i>
                      <strong>Commerçants</strong>
                    </div>
                    <span className="badge bg-warning">{stats?.totalCommercants || 0}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <div>
                      <i className="bi bi-tools me-2 text-info"></i>
                      <strong>Prestataires</strong>
                    </div>
                    <span className="badge bg-info">{stats?.totalPrestataires || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="table-container">
            <div className="p-3 border-bottom">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Actions rapides
              </h5>
            </div>
            <div className="p-3">
              <div className="d-grid gap-2">
                <a href="/documents" className="btn btn-outline-warning">
                  <i className="bi bi-file-earmark-check me-2"></i>
                  Valider les documents
                </a>
                <a href="/users" className="btn btn-outline-primary">
                  <i className="bi bi-people me-2"></i>
                  Gérer les utilisateurs
                </a>
                <a href="/annonces" className="btn btn-outline-info">
                  <i className="bi bi-megaphone me-2"></i>
                  Modérer les annonces
                </a>
                <a href="/livraisons" className="btn btn-outline-success">
                  <i className="bi bi-truck me-2"></i>
                  Suivre les livraisons
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations système */}
      <div className="row g-4">
        <div className="col-12">
          <div className="table-container">
            <div className="p-3 border-bottom">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Informations système
              </h5>
            </div>
            <div className="p-3">
              <div className="row">
                <div className="col-md-6">
                  <div className="text-muted mb-2">
                    <strong>Version BackOffice:</strong> 1.0.0-dev
                  </div>
                  <div className="text-muted mb-2">
                    <strong>API Backend:</strong> 
                    <span className="badge bg-success ms-2">Connectée</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted mb-2">
                    <strong>Dernière synchronisation:</strong> {new Date().toLocaleString('fr-FR')}
                  </div>
                  <div className="text-muted mb-2">
                    <strong>Statut:</strong> 
                    <span className="badge bg-success ms-2">Opérationnel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
