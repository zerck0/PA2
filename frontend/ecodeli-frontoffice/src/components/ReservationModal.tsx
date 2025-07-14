import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import AddressInput from './ui/AddressInput';
import Loading from './ui/Loading';
import { prestationApi } from '../services/api';
import { useToast } from '../hooks/useToast';

// Types pour les créneaux horaires
interface CreneauHoraire {
  jour: string;
  date: string;
  heures: { heure: string; disponible: boolean }[];
}

// Type pour les disponibilités du prestataire
interface PlageDisponibilite {
  id: number;
  jourSemaine: string; // MONDAY, TUESDAY, etc.
  heureDebut: string; // Format "HH:mm"
  heureFin: string; // Format "HH:mm"
  actif: boolean;
}

interface ReservationData {
  prestataireId: number;
  clientId: number;
  dateDebut: string;
  dateFin: string;
  typePrestation: string;
  titre: string;
  description: string;
  adresse: string;
  ville: string;
  codePostal: string;
  prix: number;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prestation: {
    prestataireId: number;
    prestataireName: string;
    typeService: string;
    typeServiceCode: string;
    description: string;
    tauxHoraire: number;
  } | null;
  currentUser: any;
  onReservationSuccess: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  prestation,
  currentUser,
  onReservationSuccess
}) => {
  const { showSuccess, showError } = useToast();
  
  // États du formulaire
  const [etapeActuelle, setEtapeActuelle] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingDisponibilites, setLoadingDisponibilites] = useState(false);
  
  // État des créneaux simplifiés avec dropdowns
  const [joursDisponibles, setJoursDisponibles] = useState<{value: string, label: string}[]>([]);
  const [heuresDisponibles, setHeuresDisponibles] = useState<string[]>([]);
  const [dureesDisponibles, setDureesDisponibles] = useState<number[]>([]);
  const [disponibilitesPrestataire, setDisponibilitesPrestataire] = useState<PlageDisponibilite[]>([]);
  
  const [creneauSelectionne, setCreneauSelectionne] = useState<{
    jour: string;
    heureDebut: string;
    duree: number;
    prix: number;
  }>({
    jour: '',
    heureDebut: '',
    duree: 1,
    prix: 0
  });
  
  // État du formulaire de détails
  const [formData, setFormData] = useState({
    titre: '',
    adresse: '',
    ville: '',
    codePostal: ''
  });

  // Charger les disponibilités du prestataire
  const chargerDisponibilitesPrestataire = async () => {
    if (!prestation) return;
    
    setLoadingDisponibilites(true);
    try {
      const disponibilites = await prestationApi.getDisponibilites(prestation.prestataireId);
      setDisponibilitesPrestataire(disponibilites);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      showError('Impossible de charger les disponibilités du prestataire');
      setDisponibilitesPrestataire([]);
    } finally {
      setLoadingDisponibilites(false);
    }
  };

  // Initialiser les créneaux disponibles au chargement
  useEffect(() => {
    if (isOpen && prestation) {
      chargerDisponibilitesPrestataire().then(() => {
        // Générer les options pour les dropdowns
        genererOptionsDropdowns();
      });
      setEtapeActuelle(1);
      setCreneauSelectionne({ jour: '', heureDebut: '', duree: 1, prix: 0 });
      setFormData({ titre: '', adresse: '', ville: '', codePostal: '' });
    }
  }, [isOpen, prestation]);

  // Regénérer les options quand les disponibilités changent
  useEffect(() => {
    if (disponibilitesPrestataire.length > 0) {
      genererOptionsDropdowns();
    }
  }, [disponibilitesPrestataire]);

  // Recalculer les heures disponibles quand le jour change
  useEffect(() => {
    if (creneauSelectionne.jour) {
      genererHeuresDisponibles(creneauSelectionne.jour);
    }
  }, [creneauSelectionne.jour]);

  // Recalculer les durées disponibles quand l'heure de début change
  useEffect(() => {
    if (creneauSelectionne.jour && creneauSelectionne.heureDebut) {
      genererDureesDisponibles(creneauSelectionne.jour, creneauSelectionne.heureDebut);
    }
  }, [creneauSelectionne.heureDebut]);

  // Recalculer le prix quand la durée change
  useEffect(() => {
    if (prestation && creneauSelectionne.duree > 0) {
      const nouveauPrix = creneauSelectionne.duree * prestation.tauxHoraire;
      setCreneauSelectionne(prev => ({ ...prev, prix: nouveauPrix }));
    }
  }, [creneauSelectionne.duree, prestation]);

  // Fonction pour convertir jour JS vers format backend
  const getJourSemaine = (date: Date): string => {
    const jours = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return jours[date.getDay()];
  };

  // Fonction pour vérifier si une heure est dans la pause déjeuner
  const isPauseDejeunr = (heure: number): boolean => {
    return heure >= 12 && heure < 13;
  };

  // Générer les options pour les dropdowns
  const genererOptionsDropdowns = () => {
    const jours: {value: string, label: string}[] = [];
    const aujourd_hui = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(aujourd_hui);
      date.setDate(date.getDate() + i);
      
      const jourSemaine = getJourSemaine(date);
      
      // Vérifier si le prestataire travaille ce jour-là
      const plageJour = disponibilitesPrestataire.find(p => 
        p.jourSemaine === jourSemaine && p.actif
      );
      
      if (plageJour) {
        const jourNom = i === 0 ? 'Aujourd\'hui' : 
                       i === 1 ? 'Demain' : 
                       date.toLocaleDateString('fr-FR', { weekday: 'long' });
        
        const dateStr = date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long' 
        });
        
        jours.push({
          value: date.toISOString().split('T')[0],
          label: `${jourNom} ${dateStr}`
        });
      }
    }
    
    setJoursDisponibles(jours);
  };

  // Générer les heures disponibles pour un jour donné
  const genererHeuresDisponibles = (dateSelectionnee: string) => {
    const date = new Date(dateSelectionnee);
    const jourSemaine = getJourSemaine(date);
    
    const plageJour = disponibilitesPrestataire.find(p => 
      p.jourSemaine === jourSemaine && p.actif
    );
    
    if (plageJour) {
      const heureDebut = parseInt(plageJour.heureDebut.split(':')[0]);
      const heureFin = parseInt(plageJour.heureFin.split(':')[0]);
      
      const heures = [];
      for (let h = heureDebut; h < heureFin; h++) {
        // Exclure la pause déjeuner
        if (isPauseDejeunr(h)) continue;
        
        heures.push(`${h.toString().padStart(2, '0')}:00`);
      }
      
      setHeuresDisponibles(heures);
      
      // Réinitialiser l'heure sélectionnée si elle n'est plus disponible
      if (!heures.includes(creneauSelectionne.heureDebut)) {
        setCreneauSelectionne(prev => ({ ...prev, heureDebut: '', duree: 1 }));
      }
    }
  };

  // Générer les durées disponibles selon l'heure de début
  const genererDureesDisponibles = (dateSelectionnee: string, heureDebut: string) => {
    const date = new Date(dateSelectionnee);
    const jourSemaine = getJourSemaine(date);
    
    const plageJour = disponibilitesPrestataire.find(p => 
      p.jourSemaine === jourSemaine && p.actif
    );
    
    if (plageJour) {
      const heureDebutInt = parseInt(heureDebut.split(':')[0]);
      const heureFinInt = parseInt(plageJour.heureFin.split(':')[0]);
      
      const durees = [];
      
      // Calculer la durée max possible
      let heureMaxPossible = heureFinInt;
      
      // Si on est avant 12h, s'arrêter à 12h
      if (heureDebutInt < 12) {
        heureMaxPossible = Math.min(heureMaxPossible, 12);
      }
      
      const dureeMaxPossible = heureMaxPossible - heureDebutInt;
      
      for (let d = 1; d <= Math.min(dureeMaxPossible, 8); d++) { // Max 8h
        durees.push(d);
      }
      
      setDureesDisponibles(durees);
      
      // Réinitialiser la durée si elle n'est plus disponible
      if (!durees.includes(creneauSelectionne.duree)) {
        setCreneauSelectionne(prev => ({ ...prev, duree: durees[0] || 1 }));
      }
    }
  };

  // Fonctions de gestion des changements de dropdown
  const handleJourChange = (jour: string) => {
    setCreneauSelectionne(prev => ({ 
      ...prev, 
      jour, 
      heureDebut: '', 
      duree: 1,
      prix: 0 
    }));
  };

  const handleHeureChange = (heureDebut: string) => {
    setCreneauSelectionne(prev => ({ 
      ...prev, 
      heureDebut, 
      duree: 1 
    }));
  };

  const handleDureeChange = (duree: number) => {
    setCreneauSelectionne(prev => ({ ...prev, duree }));
  };

  // Gérer la sélection d'un créneau
  const handleCreneauClick = (date: string, heure: string) => {
    const dateHeure = new Date(`${date}T${heure}:00`);
    
    if (!creneauSelectionne.debut) {
      // Premier clic : sélectionner l'heure de début
      setCreneauSelectionne({
        debut: dateHeure,
        fin: null,
        dureeHeures: 0
      });
    } else if (!creneauSelectionne.fin) {
      // Deuxième clic : sélectionner l'heure de fin
      if (dateHeure > creneauSelectionne.debut) {
        const dureeMs = dateHeure.getTime() - creneauSelectionne.debut.getTime();
        const dureeHeures = dureeMs / (1000 * 60 * 60);
        
        setCreneauSelectionne({
          debut: creneauSelectionne.debut,
          fin: dateHeure,
          dureeHeures
        });
      } else {
        showError('L\'heure de fin doit être après l\'heure de début');
      }
    } else {
      // Nouvelle sélection : recommencer
      setCreneauSelectionne({
        debut: dateHeure,
        fin: null,
        dureeHeures: 0
      });
    }
  };

  // Calculer le prix total
  const calculerPrixTotal = (): number => {
    if (!prestation || !creneauSelectionne.dureeHeures) return 0;
    return creneauSelectionne.dureeHeures * prestation.tauxHoraire;
  };

  // Gérer le changement d'adresse avec Google Places
  const handleAddressChange = (adresse: string) => {
    setFormData(prev => ({ ...prev, adresse }));
  };

  const handleCityChange = (ville: string) => {
    setFormData(prev => ({ ...prev, ville }));
  };

  // Valider et passer à l'étape suivante
  const handleEtapeSuivante = () => {
    if (etapeActuelle === 1) {
      if (!creneauSelectionne.jour || !creneauSelectionne.heureDebut || creneauSelectionne.duree === 0) {
        showError('Veuillez sélectionner un créneau horaire complet');
        return;
      }
      setEtapeActuelle(2);
    } else if (etapeActuelle === 2) {
      if (!formData.titre.trim() || !formData.adresse.trim()) {
        showError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setEtapeActuelle(3);
    }
  };

  // Créer les objets Date pour la réservation
  const creerDatesReservation = () => {
    const dateDebut = new Date(`${creneauSelectionne.jour}T${creneauSelectionne.heureDebut}:00`);
    const dateFin = new Date(dateDebut);
    dateFin.setHours(dateFin.getHours() + creneauSelectionne.duree);
    
    return { dateDebut, dateFin };
  };

  // Confirmer la réservation
  const handleConfirmerReservation = async () => {
    if (!prestation || !currentUser || !creneauSelectionne.jour || !creneauSelectionne.heureDebut || creneauSelectionne.duree === 0) {
      showError('Données de réservation incomplètes');
      return;
    }

    setLoading(true);
    
    try {
      const { dateDebut, dateFin } = creerDatesReservation();
      
      // Formater les dates au format attendu par le backend (sans millisecondes ni timezone)
      const formatDateForBackend = (date: Date): string => {
        return date.getFullYear() + '-' +
               String(date.getMonth() + 1).padStart(2, '0') + '-' +
               String(date.getDate()).padStart(2, '0') + 'T' +
               String(date.getHours()).padStart(2, '0') + ':' +
               String(date.getMinutes()).padStart(2, '0') + ':' +
               String(date.getSeconds()).padStart(2, '0');
      };

      const reservationData: ReservationData = {
        prestataireId: prestation.prestataireId,
        clientId: currentUser.user.id,
        dateDebut: formatDateForBackend(dateDebut),
        dateFin: formatDateForBackend(dateFin),
        typePrestation: prestation.typeServiceCode,
        titre: formData.titre,
        description: `${prestation.typeService} - ${formData.titre}`,
        adresse: formData.adresse,
        ville: formData.ville || 'Non spécifié',
        codePostal: formData.codePostal || '00000',
        prix: creneauSelectionne.prix
      };

      await prestationApi.creerReservation(reservationData);
      
      showSuccess('Réservation confirmée avec succès ! Vous pouvez la consulter dans votre dashboard.');
      onReservationSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Erreur lors de la réservation:', error);
      showError('Erreur lors de la réservation : ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si un créneau est sélectionné
  const isCreneauSelectionne = (date: string, heure: string): boolean => {
    if (!creneauSelectionne.debut) return false;
    
    const dateHeure = new Date(`${date}T${heure}:00`);
    
    if (creneauSelectionne.fin) {
      // Créneau complet sélectionné
      return dateHeure >= creneauSelectionne.debut && dateHeure < creneauSelectionne.fin;
    } else {
      // Seulement heure de début sélectionnée
      return dateHeure.getTime() === creneauSelectionne.debut.getTime();
    }
  };

  if (!prestation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Réserver - ${prestation.typeService}`}
      size="lg"
    >
      <div className="reservation-modal">
        {/* Indicateur d'étapes */}
        <div className="d-flex justify-content-center mb-4">
          <div className="d-flex align-items-center">
            <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
              etapeActuelle >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'
            }`} style={{ width: '30px', height: '30px' }}>
              1
            </div>
            <span className={`me-3 ${etapeActuelle >= 1 ? 'text-primary' : 'text-muted'}`}>
              Créneau
            </span>
            
            <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
              etapeActuelle >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'
            }`} style={{ width: '30px', height: '30px' }}>
              2
            </div>
            <span className={`me-3 ${etapeActuelle >= 2 ? 'text-primary' : 'text-muted'}`}>
              Détails
            </span>
            
            <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
              etapeActuelle >= 3 ? 'bg-primary text-white' : 'bg-light text-muted'
            }`} style={{ width: '30px', height: '30px' }}>
              3
            </div>
            <span className={etapeActuelle >= 3 ? 'text-primary' : 'text-muted'}>
              Confirmation
            </span>
          </div>
        </div>

        {/* Contenu selon l'étape */}
        {etapeActuelle === 1 && (
          <div>
            <h5 className="mb-3">Choisissez votre créneau horaire</h5>
            <p className="text-muted mb-3">
              Prestataire : <strong>{prestation.prestataireName}</strong> • 
              Tarif : <strong>{prestation.tauxHoraire}€/heure</strong>
            </p>
            
            {/* Chargement des disponibilités */}
            {loadingDisponibilites ? (
              <div className="text-center py-4">
                <Loading text="Chargement des disponibilités..." />
              </div>
            ) : (
              /* Interface avec dropdowns */
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">📅 Jour disponible *</label>
                  <select 
                    className="form-select"
                    value={creneauSelectionne.jour}
                    onChange={(e) => handleJourChange(e.target.value)}
                  >
                    <option value="">Choisir un jour...</option>
                    {joursDisponibles.map(jour => (
                      <option key={jour.value} value={jour.value}>
                        {jour.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">⏰ Heure de début *</label>
                  <select 
                    className="form-select"
                    value={creneauSelectionne.heureDebut}
                    onChange={(e) => handleHeureChange(e.target.value)}
                    disabled={!creneauSelectionne.jour}
                  >
                    <option value="">Choisir une heure...</option>
                    {heuresDisponibles.map(heure => (
                      <option key={heure} value={heure}>
                        {heure}
                      </option>
                    ))}
                  </select>
                  {!creneauSelectionne.jour && (
                    <small className="text-muted">Sélectionnez d'abord un jour</small>
                  )}
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">⏱️ Durée *</label>
                  <select 
                    className="form-select"
                    value={creneauSelectionne.duree}
                    onChange={(e) => handleDureeChange(parseInt(e.target.value))}
                    disabled={!creneauSelectionne.heureDebut}
                  >
                    <option value="">Choisir une durée...</option>
                    {dureesDisponibles.map(duree => (
                      <option key={duree} value={duree}>
                        {duree}h
                      </option>
                    ))}
                  </select>
                  {!creneauSelectionne.heureDebut && (
                    <small className="text-muted">Sélectionnez d'abord une heure</small>
                  )}
                </div>
              </div>
            )}

            {/* Résumé de la sélection */}
            {creneauSelectionne.jour && creneauSelectionne.heureDebut && creneauSelectionne.duree > 0 && (
              <div className="alert alert-success mt-3">
                <strong>💰 Récapitulatif :</strong>
                <br />
                📅 <strong>{joursDisponibles.find(j => j.value === creneauSelectionne.jour)?.label}</strong>
                <br />
                ⏰ De <strong>{creneauSelectionne.heureDebut}</strong> à <strong>
                  {String(parseInt(creneauSelectionne.heureDebut.split(':')[0]) + creneauSelectionne.duree).padStart(2, '0')}:00
                </strong>
                <br />
                ⏱️ Durée : <strong>{creneauSelectionne.duree}h</strong> × {prestation.tauxHoraire}€/h = <strong className="text-success">{creneauSelectionne.prix}€</strong>
              </div>
            )}

            {joursDisponibles.length === 0 && !loadingDisponibilites && (
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle"></i>
                <strong> Aucun créneau disponible</strong>
                <br />
                Ce prestataire n'a pas configuré ses disponibilités ou n'est pas disponible dans les 7 prochains jours.
              </div>
            )}
          </div>
        )}

        {etapeActuelle === 2 && (
          <div>
            <h5 className="mb-3">Détails de votre réservation</h5>
            
            <div className="row">
              <div className="col-md-6">
                <Input
                  label="Titre de la prestation *"
                  value={formData.titre}
                  onChange={(value) => setFormData(prev => ({ ...prev, titre: value }))}
                  placeholder="Ex: Ménage appartement 3 pièces"
                  required
                />
              </div>
              <div className="col-md-6">
                <AddressInput
                  label="Adresse de la prestation *"
                  value={formData.adresse}
                  onChange={handleAddressChange}
                  onCityChange={handleCityChange}
                  placeholder="Adresse complète"
                  required
                />
              </div>
            </div>

            {/* Résumé créneau */}
            <div className="alert alert-light mt-3">
              <strong>Créneau sélectionné :</strong>
              <br />
              📅 <strong>{joursDisponibles.find(j => j.value === creneauSelectionne.jour)?.label}</strong>
              <br />
              ⏰ De <strong>{creneauSelectionne.heureDebut}</strong> à <strong>
                {String(parseInt(creneauSelectionne.heureDebut.split(':')[0]) + creneauSelectionne.duree).padStart(2, '0')}:00
              </strong>
              <br />
              ⏱️ Durée : <strong>{creneauSelectionne.duree}h</strong> • Prix : <strong>{creneauSelectionne.prix}€</strong>
            </div>
          </div>
        )}

        {etapeActuelle === 3 && (
          <div>
            <h5 className="mb-3">Confirmation de réservation</h5>
            
            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Récapitulatif</h6>
                
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Prestataire :</strong> {prestation.prestataireName}</p>
                    <p><strong>Service :</strong> {prestation.typeService}</p>
                    <p><strong>Titre :</strong> {formData.titre}</p>
                    <p><strong>Adresse :</strong> {formData.adresse}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Date :</strong> {joursDisponibles.find(j => j.value === creneauSelectionne.jour)?.label}</p>
                    <p><strong>Horaire :</strong> {creneauSelectionne.heureDebut} - {' '}
                      {String(parseInt(creneauSelectionne.heureDebut.split(':')[0]) + creneauSelectionne.duree).padStart(2, '0')}:00
                    </p>
                    <p><strong>Durée :</strong> {creneauSelectionne.duree}h</p>
                    <p><strong>Tarif :</strong> {prestation.tauxHoraire}€/h</p>
                  </div>
                </div>
                
                <hr />
                <div className="text-end">
                  <h5><strong>Total : {creneauSelectionne.prix}€</strong></h5>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="d-flex justify-content-between mt-4">
          <div>
            {etapeActuelle > 1 && (
              <Button
                variant="outline-secondary"
                onClick={() => setEtapeActuelle(etapeActuelle - 1)}
              >
                Précédent
              </Button>
            )}
          </div>
          
          <div>
            <Button
              variant="secondary"
              onClick={onClose}
              className="me-2"
            >
              Annuler
            </Button>
            
            {etapeActuelle < 3 ? (
              <Button
                variant="primary"
                onClick={handleEtapeSuivante}
                disabled={
                  (etapeActuelle === 1 && (!creneauSelectionne.jour || !creneauSelectionne.heureDebut || creneauSelectionne.duree === 0)) ||
                  (etapeActuelle === 2 && (!formData.titre.trim() || !formData.adresse.trim()))
                }
              >
                Suivant
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleConfirmerReservation}
                disabled={loading}
              >
                {loading ? <Loading text="Réservation..." /> : 'Confirmer la réservation'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReservationModal;
