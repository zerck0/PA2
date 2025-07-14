import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import NoteMoyenne from '../components/NoteMoyenne';
import { profilPublicApi, evaluationApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

const ProfilPublic: React.FC = () => {
  const { role, id } = useParams<{ role: string; id: string }>();
  const [profil, setProfil] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    loadProfilData();
  }, [role, id]);

  const loadProfilData = async () => {
    if (!role || !id) return;

    setLoading(true);
    try {
      // Charger le profil selon le rôle
      let profilData;
      if (role === 'livreur') {
        profilData = await profilPublicApi.getLivreur(parseInt(id));
      } else if (role === 'prestataire') {
        profilData = await profilPublicApi.getPrestataire(parseInt(id));
      } else {
        showError('Type de profil non reconnu');
        return;
      }

      setProfil(profilData);

      // Charger les évaluations et statistiques
      const [evaluationsData, statsData] = await Promise.all([
        evaluationApi.getDernieresEvaluations(parseInt(id), 5),
        evaluationApi.getStatistiques(parseInt(id))
      ]);

      setEvaluations(evaluationsData);
      setStats(statsData);

    } catch (error: any) {
      showError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = () => {
    return currentUser && currentUser.user.id === parseInt(id || '0');
  };

  const getRoleLabel = () => {
    return role === 'livreur' ? 'Livreur' : 'Prestataire';
  };

  const getServiceType = () => {
    return role === 'livreur' ? 'LIVRAISON' : 'PRESTATION';
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profil) {
    return (
      <Layout>
        <div className="container mt-4">
          <div className="alert alert-danger">
            Profil non trouvé
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-4">
        {/* Header du profil */}
        <Card className="mb-4">
          <div className="row align-items-center">
            <div className="col-md-3 text-center">
              {/* Photo de profil */}
              <div className="position-relative d-inline-block">
                {profil.photoProfilUrl ? (
                  <img
                    src={profil.photoProfilUrl}
                    alt={`${profil.prenom} ${profil.nom}`}
                    className="rounded-circle border"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-light border d-flex align-items-center justify-content-center"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <i className="bi bi-person-fill text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-9">
              {/* Informations principales */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <h2 className="mb-0">{profil.prenom} {profil.nom}</h2>
                <span className={`badge ${role === 'livreur' ? 'bg-primary' : 'bg-success'}`}>
                  {getRoleLabel()}
                </span>
                {role === 'livreur' && profil.statutAffiliation === 'AFFILIE' && (
                  <span className="badge bg-warning">
                    <i className="bi bi-award me-1"></i>
                    Affilié
                  </span>
                )}
              </div>

              {/* Note moyenne */}
              {stats && (
                <div className="mb-3">
                  <NoteMoyenne
                    note={stats.noteMoyenne || 0}
                    nombreEvaluations={stats.totalEvaluations || 0}
                    typeService="GLOBAL"
                    size="lg"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="d-flex gap-2">
                {isOwnProfile() && (
                  <Button
                    variant="outline-primary"
                    onClick={() => window.location.href = '/profile'}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Modifier mon profil
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="row">
          {/* Biographie */}
          <div className="col-md-8">
            <Card className="mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  À propos
                </h5>
              </div>
              <div className="card-body">
                {profil.biographie ? (
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {profil.biographie}
                  </p>
                ) : (
                  <p className="text-muted mb-0">
                    Aucune biographie renseignée
                  </p>
                )}
              </div>
            </Card>

            {/* Dernières évaluations */}
            <Card>
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-star-fill me-2"></i>
                  Dernières évaluations
                </h5>
              </div>
              <div className="card-body">
                {evaluations.length > 0 ? (
                  <div className="space-y-3">
                    {evaluations.map((evaluation, index) => (
                      <div key={evaluation.id} className={index > 0 ? 'border-top pt-3' : ''}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <NoteMoyenne
                            note={evaluation.note}
                            nombreEvaluations={1}
                            showDetails={false}
                            size="sm"
                          />
                          <small className="text-muted">
                            {new Date(evaluation.dateEvaluation).toLocaleDateString()}
                          </small>
                        </div>
                        {evaluation.commentaire && (
                          <p className="mb-0 text-muted small">
                            "{evaluation.commentaire}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">
                    Aucune évaluation pour le moment
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Statistiques */}
          <div className="col-md-4">
            <Card className="mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-graph-up me-2"></i>
                  Statistiques
                </h5>
              </div>
              <div className="card-body">
                {stats ? (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>Total évaluations :</span>
                      <span className="fw-bold">{stats.totalEvaluations}</span>
                    </div>

                    {role === 'prestataire' && stats.nombrePrestations > 0 && (
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Prestations :</span>
                        <div className="text-end">
                          <div className="fw-bold">{stats.nombrePrestations}</div>
                          <NoteMoyenne
                            note={stats.noteMoyennePrestation || 0}
                            nombreEvaluations={stats.nombrePrestations}
                            showDetails={false}
                            size="sm"
                          />
                        </div>
                      </div>
                    )}

                    {role === 'livreur' && stats.nombreLivraisons > 0 && (
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Livraisons :</span>
                        <div className="text-end">
                          <div className="fw-bold">{stats.nombreLivraisons}</div>
                          <NoteMoyenne
                            note={stats.noteMoyenneLivraison || 0}
                            nombreEvaluations={stats.nombreLivraisons}
                            showDetails={false}
                            size="sm"
                          />
                        </div>
                      </div>
                    )}

                    <hr />
                    <div className="text-center">
                      <small className="text-muted">
                        Membre depuis {new Date(profil.dateCreation || profil.dateInscription).getFullYear()}
                      </small>
                    </div>
                  </>
                ) : (
                  <p className="text-muted mb-0">
                    Statistiques non disponibles
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilPublic;
