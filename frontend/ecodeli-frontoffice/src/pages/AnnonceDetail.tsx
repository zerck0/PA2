import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Annonce, Entrepot } from '../types';
import { entrepotApi, livraisonApi } from '../services/api';

const AnnonceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // États pour la modal de prise en charge
  const [showModal, setShowModal] = useState(false);
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [selectedTypeLivraison, setSelectedTypeLivraison] = useState<'complete' | 'partielle' | 'directe'>('complete');
  const [selectedEntrepot, setSelectedEntrepot] = useState<number | null>(null);
  const [loadingLivraison, setLoadingLivraison] = useState(false);

  // Détecter si l'annonce a un segment dépôt assigné
  const detecterSegmentDepotAssigne = () => {
    if (annonce?.description && annonce.description.includes('##SEGMENT_DEPOT_ASSIGNE##')) {
      const parts = annonce.description.split('##SEGMENT_DEPOT_ASSIGNE##');
      const infosParts = parts[1]?.split('##');
      return {
        aSegmentDepotAssigne: true,
        descriptionOriginale: parts[0],
        entrepotNom: infosParts[0] || '',
        livreurNom: infosParts[1] || ''
      };
    }
    return {
      aSegmentDepotAssigne: false,
      descriptionOriginale: annonce?.description || '',
      entrepotNom: '',
      livreurNom: ''
    };
  };

  const segmentInfo = detecterSegmentDepotAssigne();

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

  // Ouvrir la modal de prise en charge
  const handlePrendreEnCharge = async () => {
    if (!currentUser || currentUser.user.role !== 'LIVREUR') {
      showError('Seuls les livreurs peuvent prendre en charge des annonces');
      return;
    }

    try {
      const entrepotsData = await entrepotApi.getAll();
      setEntrepots(entrepotsData);
      setShowModal(true);
    } catch (error) {
      showError('Erreur lors du chargement des entrepôts');
    }
  };

  // Confirmer la prise en charge
  const handleConfirmerPriseEnCharge = async () => {
    if (!currentUser || !annonce) return;

    setLoadingLivraison(true);
    try {
      if (selectedTypeLivraison === 'complete') {
        await livraisonApi.creerComplete(annonce.id, currentUser.user.id, annonce.prixPropose);
        showSuccess('Livraison complète créée avec succès !');
      } else if (selectedTypeLivraison === 'directe') {
        // Pour la livraison directe (segment retrait), utiliser l'entrepôt du segment dépôt
        // On récupère l'ID de l'entrepôt à partir des segments existants
        try {
          const segmentsResponse = await fetch(`http://localhost:8080/api/annonces/${annonce.id}/segments`);
          if (segmentsResponse.ok) {
            const segmentsData = await segmentsResponse.json();
            const entrepotId = segmentsData.depot?.entrepotId;
            
            if (entrepotId) {
              await livraisonApi.creerPartielleRetrait(annonce.id, currentUser.user.id, entrepotId, annonce.prixPropose);
              showSuccess('Livraison directe créée avec succès !');
            } else {
              showError('Impossible de récupérer l\'entrepôt de dépôt');
              return;
            }
          } else {
            showError('Erreur lors de la récupération des informations de l\'entrepôt');
            return;
          }
        } catch (segmentError) {
          showError('Erreur lors de la récupération des informations de segments');
          return;
        }
      } else {
        // Livraison partielle (dépôt)
        if (!selectedEntrepot) {
          showError('Veuillez sélectionner un entrepôt');
          return;
        }
        await livraisonApi.creerPartielleDepot(annonce.id, currentUser.user.id, selectedEntrepot, annonce.prixPropose);
        showSuccess('Livraison partielle créée avec succès !');
      }
      
      setShowModal(false);
      // Recharger l'annonce pour voir le nouveau statut
      window.location.reload();
    } catch (error) {
      showError('Erreur lors de la création de la livraison');
    } finally {
      setLoadingLivraison(false);
    }
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
                <p className="text-muted">{segmentInfo.descriptionOriginale}</p>
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
                {currentUser && currentUser.user.role === 'LIVREUR' && annonce.statut === 'ACTIVE' && (
                  <Button variant="primary" onClick={handlePrendreEnCharge}>
                    <i className="bi bi-truck me-2"></i>
                    Prendre en charge
                  </Button>
                )}
                <Button variant="secondary">
                  <i className="bi bi-chat-dots me-2"></i>
                  Contacter
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Modal de prise en charge */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Prendre en charge cette annonce"
        >
          <div className="mb-4">
            {segmentInfo.aSegmentDepotAssigne ? (
              // Annonce avec segment dépôt assigné - seule option: livraison directe
              <div>
                <div className="alert alert-info mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Segment dépôt déjà assigné</strong> - Le colis est en cours de dépôt par {segmentInfo.livreurNom} vers {segmentInfo.entrepotNom}
                </div>
                
                <h6>Option disponible :</h6>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="typeLivraison"
                    id="directe"
                    checked={true}
                    onChange={() => setSelectedTypeLivraison('directe')}
                  />
                  <label className="form-check-label" htmlFor="directe">
                    <strong>Livraison directe depuis l'entrepôt</strong>
                    <br />
                    <small className="text-muted">
                      Je prends en charge la livraison de {segmentInfo.entrepotNom} à {annonce?.villeArrivee}
                    </small>
                  </label>
                </div>
              </div>
            ) : (
              // Annonce normale - toutes les options disponibles
              <div>
                <h6>Choisissez le type de livraison :</h6>
                
                {/* Option livraison complète */}
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="typeLivraison"
                    id="complete"
                    checked={selectedTypeLivraison === 'complete'}
                    onChange={() => setSelectedTypeLivraison('complete')}
                  />
                  <label className="form-check-label" htmlFor="complete">
                    <strong>Livraison complète</strong>
                    <br />
                    <small className="text-muted">
                      Je prends en charge la livraison de {annonce?.villeDepart} à {annonce?.villeArrivee} directement
                    </small>
                  </label>
                </div>

                {/* Option livraison partielle */}
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="typeLivraison"
                    id="partielle"
                    checked={selectedTypeLivraison === 'partielle'}
                    onChange={() => setSelectedTypeLivraison('partielle')}
                  />
                  <label className="form-check-label" htmlFor="partielle">
                    <strong>Livraison partielle</strong>
                    <br />
                    <small className="text-muted">
                      Je prends en charge la livraison de {annonce?.villeDepart} vers un entrepôt EcoDeli
                    </small>
                  </label>
                </div>

                {/* Sélection d'entrepôt pour livraison partielle */}
                {selectedTypeLivraison === 'partielle' && (
                  <div className="mb-3">
                    <label htmlFor="entrepot" className="form-label">
                      <strong>Sélectionnez l'entrepôt de destination :</strong>
                    </label>
                    <select
                      className="form-select"
                      id="entrepot"
                      value={selectedEntrepot || ''}
                      onChange={(e) => setSelectedEntrepot(Number(e.target.value) || null)}
                    >
                      <option value="">-- Choisir un entrepôt --</option>
                      {entrepots.map((entrepot) => (
                        <option key={entrepot.id} value={entrepot.id}>
                          {entrepot.nom} - {entrepot.ville}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Prix proposé */}
            {annonce?.prixPropose && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Prix proposé : <strong>{annonce.prixPropose}€</strong>
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmerPriseEnCharge}
              disabled={loadingLivraison || (selectedTypeLivraison === 'partielle' && !selectedEntrepot)}
            >
              {loadingLivraison ? 'Création...' : 'Confirmer la prise en charge'}
            </Button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default AnnonceDetail;
