import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { Annonce } from '../types';

const AnnonceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Charger l'annonce
  useEffect(() => {
    const loadAnnonce = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/annonces/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAnnonce(data);
        } else {
          setError('Annonce non trouvée');
        }
      } catch (err) {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAnnonce();
    }
  }, [id]);

  // Badge pour le statut
  const getStatutBadge = (statut: string) => {
    const badges = {
      'ACTIVE': { color: 'success', label: 'Disponible' },
      'ASSIGNEE': { color: 'warning', label: 'Assignée' },
      'EN_COURS': { color: 'info', label: 'En cours' },
      'TERMINEE': { color: 'secondary', label: 'Terminée' },
      'ANNULEE': { color: 'danger', label: 'Annulée' }
    };
    const badge = badges[statut as keyof typeof badges] || { color: 'secondary', label: statut };
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>;
  };

  // Badge pour le type
  const getTypeBadge = (type: string) => {
    const badges = {
      'LIVRAISON_COLIS': { color: 'primary', label: 'Livraison Colis' },
      'COURSES': { color: 'success', label: 'Courses' },
      'TRANSPORT_PERSONNE': { color: 'info', label: 'Transport Personne' },
      'SERVICE_PERSONNE': { color: 'warning', label: 'Service à la Personne' },
      'ACHAT_ETRANGER': { color: 'secondary', label: 'Achat à l\'Étranger' }
    };
    const badge = badges[type as keyof typeof badges] || { color: 'secondary', label: type };
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-fluid py-4">
          <div className="text-center">
            <Loading />
          </div>
        </div>
      </Layout>
    );
  }

  if (!annonce) {
    return (
      <Layout>
        <div className="container-fluid py-4">
          <Alert type="danger">
            {error || 'Annonce non trouvée'}
          </Alert>
          <Button variant="secondary" onClick={() => navigate('/annonces')}>
            Retour aux annonces
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid py-4">
        {/* Navigation */}
        <div className="mb-4">
          <Button variant="secondary" onClick={() => navigate('/annonces')}>
            <i className="bi bi-arrow-left me-2"></i>
            Retour aux annonces
          </Button>
        </div>

        <div className="row">
          {/* Détails de l'annonce */}
          <div className="col-lg-8">
            <Card>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="h3 mb-2">{annonce.titre}</h1>
                  <div className="d-flex gap-2 mb-3">
                    {getTypeBadge(annonce.type)}
                    {getStatutBadge(annonce.statut)}
                  </div>
                </div>
                {annonce.photoUrl && (
                  <img 
                    src={annonce.photoUrl} 
                    alt={annonce.titre}
                    className="rounded"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                )}
              </div>

              <div className="mb-4">
                <h5>Description</h5>
                <p className="text-muted">{annonce.description}</p>
              </div>

              {/* Localisation */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6><i className="bi bi-geo-alt-fill text-success me-2"></i>Point de départ</h6>
                  <p className="mb-1"><strong>{annonce.villeDepart}</strong></p>
                  <p className="text-muted small">{annonce.adresseDepart}</p>
                </div>
                <div className="col-md-6">
                  <h6><i className="bi bi-geo-alt-fill text-danger me-2"></i>Destination</h6>
                  <p className="mb-1"><strong>{annonce.villeArrivee}</strong></p>
                  <p className="text-muted small">{annonce.adresseArrivee}</p>
                </div>
              </div>

              {/* Détails du colis */}
              {annonce.type === 'LIVRAISON_COLIS' && (
                <div className="mb-4">
                  <h5>Détails du colis</h5>
                  <div className="row">
                    {annonce.typeColis && (
                      <div className="col-md-6">
                        <strong>Type :</strong> {annonce.typeColis}
                      </div>
                    )}
                    {annonce.poids && (
                      <div className="col-md-6">
                        <strong>Poids :</strong> {annonce.poids} kg
                      </div>
                    )}
                    {annonce.dimensions && (
                      <div className="col-md-6">
                        <strong>Dimensions :</strong> {annonce.dimensions}
                      </div>
                    )}
                    <div className="col-md-6">
                      <strong>Fragile :</strong> {annonce.fragile ? 'Oui' : 'Non'}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar avec infos */}
          <div className="col-lg-4">
            <Card title="Informations">
              {/* Prix */}
              {annonce.prixPropose && (
                <div className="mb-3">
                  <h4 className="text-success mb-0">
                    <i className="bi bi-currency-euro me-1"></i>
                    {annonce.prixPropose}€
                  </h4>
                  {annonce.prixNegociable && (
                    <small className="text-muted">Prix négociable</small>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="mb-3">
                <small className="text-muted d-block">Publié le</small>
                <strong>{new Date(annonce.dateCreation).toLocaleDateString()}</strong>
              </div>

              {annonce.datePreferee && (
                <div className="mb-3">
                  <small className="text-muted d-block">Date préférée</small>
                  <strong>{new Date(annonce.datePreferee).toLocaleDateString()}</strong>
                </div>
              )}

              {/* Auteur */}
              <div className="mb-4">
                <small className="text-muted d-block">Publié par</small>
                <strong>{annonce.auteur.prenom} {annonce.auteur.nom}</strong>
              </div>

              {/* Actions */}
              <div className="d-grid gap-2">
                <Button variant="secondary">
                  <i className="bi bi-chat-dots me-2"></i>
                  Contacter
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnnonceDetail;
