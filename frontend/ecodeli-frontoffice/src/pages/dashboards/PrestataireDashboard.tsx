import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { prestationApi, photoApi } from '../../services/api';
import DashboardLayout from './shared/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import PhotoUpload from '../../components/ui/PhotoUpload';

interface Prestation {
  id: number;
  titre: string;
  description: string;
  typePrestation: string;
  dateDebut: string;
  dateFin: string;
  adresse: string;
  ville: string;
  prix: number;
  statut: string;
  client: {
    nom: string;
    prenom: string;
  };
}

interface PlageDisponibilite {
  id?: number;
  jourSemaine: string;
  heureDebut: string;
  heureFin: string;
  actif: boolean;
}

interface DashboardStats {
  prestationsMois: number;
  revenusMois: number;
  prestationsEnAttente: number;
  noteGlobale: number;
}

const PrestataireDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'prestations' | 'ma-prestation' | 'planning' | 'planning-config' | 'revenus'>('overview');
  
  // États
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [disponibilites, setDisponibilites] = useState<PlageDisponibilite[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    prestationsMois: 0,
    revenusMois: 0,
    prestationsEnAttente: 0,
    noteGlobale: 4.5
  });
  const [loading, setLoading] = useState(true);
  
  // États pour la configuration de prestation
  const [profilPrestation, setProfilPrestation] = useState({
    descriptionPrestation: '',
    typePrestationPrincipale: '',
    photoPrestation: ''
  });
  const [categories, setCategories] = useState<Record<string, Array<{value: string, label: string}>>>({});
  const [loadingProfil, setLoadingProfil] = useState(false);
  
  // États pour la configuration des disponibilités
  const [configDisponibilites, setConfigDisponibilites] = useState<{[key: string]: {actif: boolean, heureDebut: string, heureFin: string}}>({
    'MONDAY': { actif: false, heureDebut: '08:00', heureFin: '18:00' },
    'TUESDAY': { actif: false, heureDebut: '08:00', heureFin: '18:00' },
    'WEDNESDAY': { actif: false, heureDebut: '08:00', heureFin: '18:00' },
    'THURSDAY': { actif: false, heureDebut: '08:00', heureFin: '18:00' },
    'FRIDAY': { actif: false, heureDebut: '08:00', heureFin: '18:00' },
    'SATURDAY': { actif: false, heureDebut: '08:00', heureFin: '18:00' },
    'SUNDAY': { actif: false, heureDebut: '08:00', heureFin: '18:00' }
  });
  const [loadingConfig, setLoadingConfig] = useState(false);

  const userId = currentUser?.user?.id;

  useEffect(() => {
    if (userId) {
      loadDashboardData();
      loadCategories();
      loadProfilPrestation();
    }
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPrestations(),
        loadDisponibilites(),
        loadStats()
      ]);
    } catch (error) {
      showError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadPrestations = async () => {
    try {
      if (userId) {
        const data = await prestationApi.getByPrestataire(userId);
        setPrestations(data);
        
        // Calculer les stats à partir des prestations
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const prestationsCeMois = data.filter((p: Prestation) => {
          const prestationDate = new Date(p.dateDebut);
          return prestationDate.getMonth() + 1 === currentMonth && 
                 prestationDate.getFullYear() === currentYear;
        });
        
        const prestationsEnAttente = data.filter((p: Prestation) => p.statut === 'EN_ATTENTE');
        
        setStats(prev => ({
          ...prev,
          prestationsMois: prestationsCeMois.length,
          prestationsEnAttente: prestationsEnAttente.length
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prestations:', error);
    }
  };

  const loadDisponibilites = async () => {
    try {
      if (userId) {
        const data = await prestationApi.getDisponibilites(userId);
        setDisponibilites(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    }
  };

  const loadStats = async () => {
    try {
      if (userId) {
        const currentDate = new Date();
        const annee = currentDate.getFullYear();
        const mois = currentDate.getMonth() + 1;
        
        const data = await prestationApi.getRevenusMensuel(userId, annee, mois);
        setStats(prev => ({ ...prev, revenusMois: data.revenus || 0 }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await prestationApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const loadProfilPrestation = async () => {
    try {
      if (userId) {
        const data = await prestationApi.getProfil(userId);
        setProfilPrestation(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const saveProfilPrestation = async () => {
    try {
      if (!userId) return;
      
      setLoadingProfil(true);
      
      // Nettoyer les données avant l'envoi
      const cleanedData = {
        descriptionPrestation: profilPrestation.descriptionPrestation || '',
        typePrestationPrincipale: profilPrestation.typePrestationPrincipale || null,
        photoPrestation: profilPrestation.photoPrestation || ''
      };
      
      // Ne pas envoyer un type vide
      if (cleanedData.typePrestationPrincipale === '') {
        cleanedData.typePrestationPrincipale = null;
      }
      
      await prestationApi.configurerProfil(userId, cleanedData);
      showSuccess('Profil mis à jour avec succès');
    } catch (error) {
      showError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoadingProfil(false);
    }
  };

  const handlePhotoUpload = async (file: File): Promise<string> => {
    try {
      if (!userId) throw new Error('Utilisateur non connecté');
      
      const photoResponse = await photoApi.uploadAnnoncePhoto(file, userId);
      
      // Extraire l'URL de la réponse (le backend retourne {id, url, nom})
      const photoUrl = photoResponse.url;
      
      // Mettre à jour le profil avec la nouvelle photo
      setProfilPrestation(prev => ({
        ...prev,
        photoPrestation: photoUrl
      }));
      
      showSuccess('Photo uploadée avec succès');
      return photoUrl;
    } catch (error) {
      showError('Erreur lors de l\'upload de la photo');
      throw error;
    }
  };

  const handlePhotoRemove = () => {
    setProfilPrestation(prev => ({
      ...prev,
      photoPrestation: ''
    }));
  };

  // Fonctions pour la gestion des disponibilités
  const initConfigFromDisponibilites = () => {
    const newConfig = { ...configDisponibilites };
    disponibilites.forEach(dispo => {
      newConfig[dispo.jourSemaine] = {
        actif: dispo.actif,
        heureDebut: dispo.heureDebut,
        heureFin: dispo.heureFin
      };
    });
    setConfigDisponibilites(newConfig);
  };

  const saveDisponibilites = async () => {
    try {
      if (!userId) return;
      
      setLoadingConfig(true);
      
      // Convertir la configuration en tableau de PlageDisponibilite
      const plages: PlageDisponibilite[] = Object.entries(configDisponibilites)
        .filter(([_, config]) => config.actif)
        .map(([jour, config]) => ({
          jourSemaine: jour,
          heureDebut: config.heureDebut,
          heureFin: config.heureFin,
          actif: true
        }));
      
      await prestationApi.configurerDisponibilites(userId, plages);
      showSuccess('Disponibilités mises à jour avec succès');
      
      // Recharger les disponibilités
      await loadDisponibilites();
      setActiveTab('planning');
    } catch (error) {
      showError('Erreur lors de la mise à jour des disponibilités');
    } finally {
      setLoadingConfig(false);
    }
  };

  const toggleJour = (jour: string) => {
    setConfigDisponibilites(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        actif: !prev[jour].actif
      }
    }));
  };

  const updateHoraire = (jour: string, field: 'heureDebut' | 'heureFin', value: string) => {
    setConfigDisponibilites(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        [field]: value
      }
    }));
  };

  // Initialiser la configuration quand on charge les disponibilités
  useEffect(() => {
    if (disponibilites.length > 0) {
      initConfigFromDisponibilites();
    }
  }, [disponibilites]);

  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-warning';
      case 'ACCEPTEE': return 'bg-info';
      case 'EN_COURS': return 'bg-primary';
      case 'TERMINEE': return 'bg-success';
      case 'ANNULEE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'ACCEPTEE': return 'Acceptée';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderOverview = () => (
    <div className="row">
      {/* Statistiques */}
      <div className="col-12 mb-4">
        <div className="row">
          <div className="col-md-3 mb-3">
            <Card className="border-primary">
              <div className="card-body text-center">
                <i className="bi bi-calendar-check text-primary" style={{ fontSize: '2rem' }}></i>
                <h4 className="mt-2 mb-0">{stats.prestationsMois}</h4>
                <small className="text-muted">Prestations ce mois</small>
              </div>
            </Card>
          </div>
          <div className="col-md-3 mb-3">
            <Card className="border-success">
              <div className="card-body text-center">
                <i className="bi bi-currency-euro text-success" style={{ fontSize: '2rem' }}></i>
                <h4 className="mt-2 mb-0">{stats.revenusMois.toFixed(2)}€</h4>
                <small className="text-muted">Revenus ce mois</small>
              </div>
            </Card>
          </div>
          <div className="col-md-3 mb-3">
            <Card className="border-warning">
              <div className="card-body text-center">
                <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
                <h4 className="mt-2 mb-0">{stats.prestationsEnAttente}</h4>
                <small className="text-muted">En attente</small>
              </div>
            </Card>
          </div>
          <div className="col-md-3 mb-3">
            <Card className="border-info">
              <div className="card-body text-center">
                <i className="bi bi-star-fill text-info" style={{ fontSize: '2rem' }}></i>
                <h4 className="mt-2 mb-0">{stats.noteGlobale}/5</h4>
                <small className="text-muted">Note moyenne</small>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Prochaines prestations */}
      <div className="col-md-8">
        <Card title="Prochaines prestations">
          {prestations.slice(0, 3).map((prestation) => (
            <div key={prestation.id} className="border-bottom pb-2 mb-2">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1">{prestation.titre}</h6>
                  <small className="text-muted">
                    {formatDateTime(prestation.dateDebut)} - {prestation.ville}
                  </small>
                  <br />
                  <small className="text-muted">
                    Client: {prestation.client.prenom} {prestation.client.nom}
                  </small>
                </div>
                <div className="text-end">
                  <span className={`badge ${getStatusBadgeClass(prestation.statut)} mb-1`}>
                    {getStatusLabel(prestation.statut)}
                  </span>
                  <br />
                  <strong>{prestation.prix}€</strong>
                </div>
              </div>
            </div>
          ))}
          {prestations.length === 0 && (
            <Alert type="info">
              Aucune prestation programmée pour le moment.
            </Alert>
          )}
        </Card>
      </div>

      {/* Planning rapide */}
      <div className="col-md-4">
        <Card title="Planning de la semaine">
          <div className="text-center">
            <i className="bi bi-calendar3" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <p className="mt-3 text-muted">
              {disponibilites.length > 0 
                ? `${disponibilites.length} jours configurés`
                : 'Aucune disponibilité configurée'
              }
            </p>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setActiveTab('planning')}
            >
              Gérer mon planning
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderPrestations = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Mes prestations</h4>
        <div>
          <Button variant="outline-primary" size="sm" className="me-2">
            <i className="bi bi-funnel me-1"></i>
            Filtrer
          </Button>
        </div>
      </div>

      <div className="row">
        {prestations.map((prestation) => (
          <div key={prestation.id} className="col-md-6 mb-3">
            <Card>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{prestation.titre}</h6>
                <span className={`badge ${getStatusBadgeClass(prestation.statut)}`}>
                  {getStatusLabel(prestation.statut)}
                </span>
              </div>
              <div className="card-body">
                <p className="mb-2">{prestation.description}</p>
                <div className="row text-sm">
                  <div className="col-6">
                    <strong>Début:</strong><br />
                    {formatDateTime(prestation.dateDebut)}
                  </div>
                  <div className="col-6">
                    <strong>Fin:</strong><br />
                    {formatDateTime(prestation.dateFin)}
                  </div>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      {prestation.adresse}, {prestation.ville}
                    </small>
                  </div>
                  <strong className="text-success">{prestation.prix}€</strong>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {prestations.length === 0 && (
        <Alert type="info">
          <h5>Aucune prestation pour le moment</h5>
          <p>Configurez vos disponibilités pour que les clients puissent réserver vos services.</p>
          <Button variant="primary" onClick={() => setActiveTab('planning')}>
            Configurer mes disponibilités
          </Button>
        </Alert>
      )}
    </div>
  );

  const renderPlanning = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Mon planning</h4>
          <p className="text-muted mb-0">Configurez vos disponibilités par jour de la semaine</p>
        </div>
        <Button variant="primary" onClick={() => setActiveTab('planning-config')}>
          <i className="bi bi-gear me-1"></i>
          Configurer
        </Button>
      </div>

      {/* Résumé des disponibilités */}
      <Card title="Mes disponibilités" className="mb-4">
        {disponibilites.length > 0 ? (
          <div className="row">
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
              const dayDisplay = {
                'MONDAY': 'Lundi',
                'TUESDAY': 'Mardi', 
                'WEDNESDAY': 'Mercredi',
                'THURSDAY': 'Jeudi',
                'FRIDAY': 'Vendredi',
                'SATURDAY': 'Samedi',
                'SUNDAY': 'Dimanche'
              }[day];
              
              const dispo = disponibilites.find(d => d.jourSemaine === day);
              
              return (
                <div key={day} className="col-md-6 col-lg-4 mb-2">
                  <div className={`p-2 rounded ${dispo ? 'bg-success bg-opacity-10 border border-success' : 'bg-light'}`}>
                    <strong>{dayDisplay}</strong>
                    {dispo ? (
                      <div className="small text-success">
                        {dispo.heureDebut} - {dispo.heureFin}
                        <br />
                        <span className="text-muted">(Pause 12h-13h)</span>
                      </div>
                    ) : (
                      <div className="small text-muted">Non disponible</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Alert type="warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Aucune disponibilité configurée</strong><br />
            Configurez vos créneaux de disponibilité pour que les clients puissent réserver vos services.
          </Alert>
        )}
      </Card>

      {/* Prochaines prestations */}
      <Card title="Prestations à venir">
        {prestations.filter(p => new Date(p.dateDebut) > new Date() && p.statut !== 'ANNULEE').length > 0 ? (
          <div className="row">
            {prestations
              .filter(p => new Date(p.dateDebut) > new Date() && p.statut !== 'ANNULEE')
              .slice(0, 4)
              .map((prestation) => (
                <div key={prestation.id} className="col-md-6 mb-3">
                  <div className="border rounded p-3">
                    <h6 className="mb-1">{prestation.titre}</h6>
                    <div className="small text-muted mb-2">
                      <i className="bi bi-calendar me-1"></i>
                      {formatDateTime(prestation.dateDebut)}
                    </div>
                    <div className="small text-muted mb-2">
                      <i className="bi bi-person me-1"></i>
                      {prestation.client.prenom} {prestation.client.nom}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge ${getStatusBadgeClass(prestation.statut)}`}>
                        {getStatusLabel(prestation.statut)}
                      </span>
                      <strong className="text-success">{prestation.prix}€</strong>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Alert type="info">
            <i className="bi bi-calendar-x me-2"></i>
            Aucune prestation programmée.
          </Alert>
        )}
      </Card>
    </div>
  );

  const renderMaPrestation = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Configurer ma prestation</h4>
          <p className="text-muted mb-0">Décrivez votre service et ajoutez une photo</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card title="Informations de ma prestation">
            <div className="mb-3">
              <label className="form-label">Type de service principal</label>
              <select 
                className="form-select"
                value={profilPrestation.typePrestationPrincipale}
                onChange={(e) => setProfilPrestation(prev => ({
                  ...prev,
                  typePrestationPrincipale: e.target.value
                }))}
              >
                <option value="">Sélectionnez votre spécialité</option>
                {Object.entries(categories).map(([categorie, types]) => (
                  <optgroup key={categorie} label={categorie}>
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Description de mes services</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Décrivez en détail vos services, votre expérience, vos spécialités..."
                value={profilPrestation.descriptionPrestation}
                onChange={(e) => setProfilPrestation(prev => ({
                  ...prev,
                  descriptionPrestation: e.target.value
                }))}
              />
              <small className="text-muted">
                Cette description sera visible par les clients potentiels.
              </small>
            </div>

            <div className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                onClick={saveProfilPrestation}
                disabled={loadingProfil}
              >
                {loadingProfil ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        <div className="col-md-4">
          <Card title="Photo de présentation">
            <div className="text-center">
              {profilPrestation.photoPrestation ? (
                <div className="mb-3">
                  <img 
                    src={profilPrestation.photoPrestation} 
                    alt="Photo de prestation"
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              ) : (
                <div className="mb-3 py-4" style={{ backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6' }}>
                  <i className="bi bi-camera" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                  <p className="text-muted mt-2">Aucune photo</p>
                </div>
              )}
              
              <PhotoUpload
                onUpload={handlePhotoUpload}
                onRemove={handlePhotoRemove}
                currentPhotoUrl={profilPrestation.photoPrestation}
              />
              
              <small className="text-muted d-block mt-2">
                Une photo de qualité augmente vos chances d'être choisi par les clients.
              </small>
            </div>
          </Card>
        </div>
      </div>

      {/* Aperçu - Toujours visible */}
      <Card title="Aperçu de votre profil" className="mt-4">
        <div className="row">
          <div className="col-md-3">
            {profilPrestation.photoPrestation ? (
              <img 
                src={profilPrestation.photoPrestation} 
                alt="Photo de prestation"
                className="img-fluid rounded"
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '100px' }}>
                <i className="bi bi-person-circle" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
              </div>
            )}
          </div>
          <div className="col-md-9">
            <h5>{currentUser?.user?.prenom} {currentUser?.user?.nom}</h5>
            <p className="text-primary mb-2">
              <i className="bi bi-star-fill me-1"></i>
              {stats.noteGlobale}/5 ⭐
            </p>
            <p className="mb-2">
              <strong>Spécialité :</strong> {
                profilPrestation.typePrestationPrincipale 
                  ? Object.values(categories).flat()
                      .find(type => type.value === profilPrestation.typePrestationPrincipale)?.label
                  : <span className="text-muted">Non renseignée</span>
              }
            </p>
            <p className="text-muted">
              {profilPrestation.descriptionPrestation || <span className="fst-italic">Aucune description renseignée</span>}
            </p>
            
            {/* Message d'encouragement si le profil n'est pas configuré */}
            {!profilPrestation.typePrestationPrincipale && !profilPrestation.descriptionPrestation && (
              <div className="alert alert-info mt-3">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Configurez votre profil</strong> pour attirer plus de clients ! 
                Renseignez votre spécialité et ajoutez une description de vos services.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPlanningConfig = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Configurer mes disponibilités</h4>
          <p className="text-muted mb-0">Définissez vos horaires de travail par jour</p>
        </div>
        <Button variant="outline-secondary" onClick={() => setActiveTab('planning')}>
          <i className="bi bi-arrow-left me-1"></i>
          Retour au planning
        </Button>
      </div>

      <Alert type="info" className="mb-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Pause déjeuner automatique :</strong> Une pause de 12h à 13h sera automatiquement appliquée sur tous vos créneaux.
      </Alert>

      <Card title="Configuration par jour">
        {Object.entries(configDisponibilites).map(([jour, config]) => {
          const dayDisplay = {
            'MONDAY': 'Lundi',
            'TUESDAY': 'Mardi',
            'WEDNESDAY': 'Mercredi', 
            'THURSDAY': 'Jeudi',
            'FRIDAY': 'Vendredi',
            'SATURDAY': 'Samedi',
            'SUNDAY': 'Dimanche'
          }[jour];

          return (
            <div key={jour} className="row align-items-center py-3 border-bottom">
              <div className="col-md-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`jour-${jour}`}
                    checked={config.actif}
                    onChange={() => toggleJour(jour)}
                  />
                  <label className="form-check-label fw-bold" htmlFor={`jour-${jour}`}>
                    {dayDisplay}
                  </label>
                </div>
              </div>

              {config.actif && (
                <>
                  <div className="col-md-3">
                    <label className="form-label small">Début</label>
                    <select
                      className="form-select form-select-sm"
                      value={config.heureDebut}
                      onChange={(e) => updateHoraire(jour, 'heureDebut', e.target.value)}
                    >
                      {Array.from({length: 13}, (_, i) => {
                        const hour = (i + 8).toString().padStart(2, '0');
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small">Fin</label>
                    <select
                      className="form-select form-select-sm"
                      value={config.heureFin}
                      onChange={(e) => updateHoraire(jour, 'heureFin', e.target.value)}
                    >
                      {Array.from({length: 13}, (_, i) => {
                        const hour = (i + 8).toString().padStart(2, '0');
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      Créneaux : {config.heureDebut}-12:00 et 13:00-{config.heureFin}
                    </small>
                  </div>
                </>
              )}

              {!config.actif && (
                <div className="col-md-6">
                  <small className="text-muted">Non disponible</small>
                </div>
              )}
            </div>
          );
        })}

        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="primary"
            onClick={saveDisponibilites}
            disabled={loadingConfig}
          >
            {loadingConfig ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Enregistrer mes disponibilités
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Aperçu */}
      <Card title="Aperçu de vos disponibilités" className="mt-4">
        <div className="row">
          {Object.entries(configDisponibilites)
            .filter(([_, config]) => config.actif)
            .map(([jour, config]) => {
              const dayDisplay = {
                'MONDAY': 'Lundi',
                'TUESDAY': 'Mardi',
                'WEDNESDAY': 'Mercredi',
                'THURSDAY': 'Jeudi', 
                'FRIDAY': 'Vendredi',
                'SATURDAY': 'Samedi',
                'SUNDAY': 'Dimanche'
              }[jour];

              return (
                <div key={jour} className="col-md-6 col-lg-4 mb-3">
                  <div className="p-3 bg-success bg-opacity-10 border border-success rounded">
                    <h6 className="mb-1 text-success">{dayDisplay}</h6>
                    <div className="small">
                      <div>{config.heureDebut} - 12:00</div>
                      <div>13:00 - {config.heureFin}</div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {Object.values(configDisponibilites).every(config => !config.actif) && (
          <Alert type="warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Aucun jour sélectionné. Activez au moins un jour pour permettre les réservations.
          </Alert>
        )}
      </Card>
    </div>
  );

  const renderRevenus = () => (
    <div>
      <h4 className="mb-4">Mes revenus</h4>
      <div className="row">
        <div className="col-md-4 mb-3">
          <Card>
            <div className="card-body text-center">
              <h3 className="text-success">{stats.revenusMois.toFixed(2)}€</h3>
              <p className="text-muted">Revenus ce mois</p>
            </div>
          </Card>
        </div>
        <div className="col-md-8">
          <Alert type="info">
            <strong>Facturation automatique</strong><br />
            Vos revenus seront calculés automatiquement en fin de mois et un virement 
            sera effectué selon les conditions de votre contrat.
          </Alert>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'prestations': return renderPrestations();
      case 'ma-prestation': return renderMaPrestation();
      case 'planning': return renderPlanning();
      case 'planning-config': return renderPlanningConfig();
      case 'revenus': return renderRevenus();
      default: return renderOverview();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'bi-house' },
    { id: 'prestations', label: 'Mes prestations', icon: 'bi-list-task' },
    { id: 'ma-prestation', label: 'Ma Prestation', icon: 'bi-person-badge' },
    { id: 'planning', label: 'Planning', icon: 'bi-calendar3' },
    { id: 'revenus', label: 'Revenus', icon: 'bi-currency-euro' }
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'overview' | 'prestations' | 'ma-prestation' | 'planning' | 'revenus');
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabs={tabs}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Dashboard Prestataire</h2>
          <p className="text-muted mb-0">
            Gérez vos prestations et disponibilités.
          </p>
        </div>
        <div>
          <Button variant="primary" onClick={loadDashboardData}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Actualiser
          </Button>
        </div>
      </div>

      {renderContent()}
    </DashboardLayout>
  );
};

export default PrestataireDashboard;
