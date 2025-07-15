import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import NoteMoyenne from './NoteMoyenne';
import EvaluationModal from './EvaluationModal';
import { Prestation, User } from '../types';
import { useToast } from '../hooks/useToast';
import { prestationApi, evaluationApi } from '../services/api';

interface PrestationCardProps {
  prestation: Prestation;
  currentUser: User;
  onEvaluationSubmitted?: () => void;
}

const PrestationCard: React.FC<PrestationCardProps> = ({ 
  prestation, 
  currentUser,
  onEvaluationSubmitted
}) => {
  const { showSuccess, showError } = useToast();
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour obtenir l'URL complète d'une image
  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    
    if (photoUrl.startsWith('/api')) {
      return photoUrl;
    }
    
    const baseUrl = import.meta.env.PROD 
      ? (import.meta.env.VITE_API_URL || 'http://localhost:8080')
      : '';
      
    return baseUrl + photoUrl;
  };

  // Badge pour le type de prestation
  const getTypeBadge = (type: string) => {
    const badges = {
      'MENAGE': { color: 'primary', label: 'Ménage', icon: '🧹' },
      'JARDINAGE': { color: 'success', label: 'Jardinage', icon: '🌱' },
      'GARDE_ENFANTS': { color: 'warning', label: 'Garde d\'enfants', icon: '👶' },
      'GARDE_ANIMAUX': { color: 'info', label: 'Garde d\'animaux', icon: '🐕' },
      'CUISINE_DOMICILE': { color: 'danger', label: 'Cuisine', icon: '👨‍🍳' },
      'BRICOLAGE': { color: 'dark', label: 'Bricolage', icon: '🔧' },
      'SOUTIEN_SCOLAIRE': { color: 'secondary', label: 'Soutien scolaire', icon: '📚' },
      'TRANSPORT_PERSONNE': { color: 'info', label: 'Transport', icon: '🚗' },
    };
    const badge = badges[type as keyof typeof badges] || { color: 'secondary', label: type, icon: '⚡' };
    return (
      <span className={`badge bg-${badge.color} me-2`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  // Badge pour le statut de prestation
  const getStatutBadge = (statut: string) => {
    const badges = {
      'RESERVEE': { color: 'primary', label: 'Réservée' },
      'TERMINEE': { color: 'success', label: 'Terminée' },
      'EVALUEE': { color: 'info', label: 'Évaluée' },
      'ANNULEE': { color: 'danger', label: 'Annulée' }
    };
    const badge = badges[statut as keyof typeof badges] || { color: 'secondary', label: statut };
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>;
  };

  // Troncature de la description
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Formatage de la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatage de l'heure
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Vérifier si le client peut évaluer (prestation terminée et client connecté)
  const peutEvaluer = () => {
    return prestation.statut === 'TERMINEE' && 
           currentUser.role === 'CLIENT' && 
           currentUser.id === prestation.client.id;
  };

  // Vérifier si le client peut marquer comme terminée
  const peutMarquerTerminee = () => {
    return prestation.statut === 'RESERVEE' && 
           currentUser.role === 'CLIENT' && 
           currentUser.id === prestation.client.id;
  };

  // Marquer la prestation comme terminée
  const handleMarquerTerminee = async () => {
    setIsLoading(true);
    try {
      await prestationApi.marquerTerminee(prestation.id, currentUser.id);
      showSuccess('Prestation marquée comme terminée !');
      onEvaluationSubmitted?.(); // Recharger les prestations
    } catch (error: any) {
      showError(error.message || 'Erreur lors du marquage de la prestation');
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'ouverture du modal d'évaluation
  const handleEvaluer = () => {
    setShowEvaluationModal(true);
  };

  // Callback après soumission d'évaluation
  const handleEvaluationSubmitted = async () => {
    try {
      // Marquer la prestation comme évaluée après l'évaluation
      await prestationApi.marquerEvaluee(prestation.id);
      showSuccess('Évaluation soumise avec succès !');
      setShowEvaluationModal(false);
      onEvaluationSubmitted?.();
    } catch (error: any) {
      showError('Erreur lors de la finalisation de l\'évaluation');
    }
  };

  return (
    <>
      <Card className="h-100 prestation-card">
        <div className="row g-0 h-100">
          {/* Image de la prestation */}
          <div className="col-md-4">
            <div 
              className="d-flex align-items-center justify-content-center bg-light rounded-start position-relative"
              style={{ 
                width: '100%',
                height: '220px',
                overflow: 'hidden'
              }}
            >
              {(() => {
                const photoUrl = prestation.prestataire.photoPrestation;
                return getImageUrl(photoUrl) ? (
                  <img 
                    src={getImageUrl(photoUrl)!} 
                    alt={`Prestation ${prestation.typePrestation}`}
                    className="rounded-start"
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    onError={(e) => {
                      // Fallback vers les icônes si l'image ne charge pas
                      const container = (e.target as HTMLImageElement).parentElement;
                      if (container) {
                        container.innerHTML = `
                          <div class="text-center">
                            <div style="font-size: 3rem;">
                              ${prestation.typePrestation === 'MENAGE' ? '🧹' :
                                prestation.typePrestation === 'JARDINAGE' ? '🌱' :
                                prestation.typePrestation === 'GARDE_ENFANTS' ? '👶' :
                                prestation.typePrestation === 'GARDE_ANIMAUX' ? '🐕' :
                                prestation.typePrestation === 'CUISINE_DOMICILE' ? '👨‍🍳' :
                                prestation.typePrestation === 'BRICOLAGE' ? '🔧' :
                                prestation.typePrestation === 'SOUTIEN_SCOLAIRE' ? '📚' : '⚡'}
                            </div>
                            <small class="text-muted">Service</small>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  // Fallback vers les icônes si pas de photo
                  <div className="text-center">
                    <div style={{ fontSize: '3rem' }}>
                      {prestation.typePrestation === 'MENAGE' && '🧹'}
                      {prestation.typePrestation === 'JARDINAGE' && '🌱'}
                      {prestation.typePrestation === 'GARDE_ENFANTS' && '👶'}
                      {prestation.typePrestation === 'GARDE_ANIMAUX' && '🐕'}
                      {prestation.typePrestation === 'CUISINE_DOMICILE' && '👨‍🍳'}
                      {prestation.typePrestation === 'BRICOLAGE' && '🔧'}
                      {prestation.typePrestation === 'SOUTIEN_SCOLAIRE' && '📚'}
                      {prestation.typePrestation === 'TRANSPORT_PERSONNE' && '🚗'}
                      {prestation.typePrestation === 'TRANSFERT_AEROPORT' && '✈️'}
                      {prestation.typePrestation === 'LIVRAISON_COLIS' && '📦'}
                      {prestation.typePrestation === 'COURSES' && '🛒'}
                      {prestation.typePrestation === 'ACHAT_ETRANGER' && '🌍'}
                      {prestation.typePrestation === 'SHOPPING_ACCOMPAGNE' && '🛍️'}
                      {prestation.typePrestation === 'ACCOMPAGNEMENT_PERSONNE' && '👥'}
                      {prestation.typePrestation === 'AIDE_ADMINISTRATIVE' && '📋'}
                      {prestation.typePrestation === 'REPARATION_ELECTROMENAGER' && '🔧'}
                      {prestation.typePrestation === 'MONTAGE_MEUBLE' && '🪑'}
                      {prestation.typePrestation === 'COURS_PARTICULIER' && '🎓'}
                      {prestation.typePrestation === 'FORMATION_INFORMATIQUE' && '💻'}
                      {!['MENAGE', 'JARDINAGE', 'GARDE_ENFANTS', 'GARDE_ANIMAUX', 'CUISINE_DOMICILE', 'BRICOLAGE', 'SOUTIEN_SCOLAIRE', 'TRANSPORT_PERSONNE', 'TRANSFERT_AEROPORT', 'LIVRAISON_COLIS', 'COURSES', 'ACHAT_ETRANGER', 'SHOPPING_ACCOMPAGNE', 'ACCOMPAGNEMENT_PERSONNE', 'AIDE_ADMINISTRATIVE', 'REPARATION_ELECTROMENAGER', 'MONTAGE_MEUBLE', 'COURS_PARTICULIER', 'FORMATION_INFORMATIQUE'].includes(prestation.typePrestation) && '⚡'}
                    </div>
                    <small className="text-muted">Service</small>
                  </div>
                );
              })()}
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="col-md-8">
            <div className="card-body h-100 d-flex flex-column">
              {/* Header avec badges */}
              <div className="d-flex flex-wrap align-items-center mb-2 gap-1">
                {getTypeBadge(prestation.typePrestation)}
                {getStatutBadge(prestation.statut)}
              </div>
              
              {/* Titre */}
              <h5 className="card-title mb-2">{prestation.titre}</h5>
              
              {/* Description */}
              <p className="card-text text-muted mb-3">
                {truncateText(prestation.description)}
              </p>
              
              {/* Informations de service */}
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-calendar-event me-2 text-primary"></i>
                  <div>
                    <strong>{formatDate(prestation.dateDebut)}</strong>
                    <div><small className="text-muted">
                      {formatTime(prestation.dateDebut)} - {formatTime(prestation.dateFin)}
                    </small></div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <i className="bi bi-geo-alt me-2 text-success"></i>
                  <div>
                    <strong>{prestation.ville}</strong>
                    <div><small className="text-muted">{prestation.adresse}</small></div>
                  </div>
                </div>
              </div>

              {/* Section prestataire avec photo de profil et note */}
              <div className="mb-3 p-2 bg-light rounded">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    {/* Photo de profil du prestataire */}
                    {(() => {
                      const photoProfilUrl = prestation.prestataire.photoProfilUrl;
                      return getImageUrl(photoProfilUrl) ? (
                        <img 
                          src={getImageUrl(photoProfilUrl)!} 
                          alt={`${prestation.prestataire.prenom} ${prestation.prestataire.nom}`}
                          className="rounded-circle me-2"
                          style={{ 
                            width: '40px', 
                            height: '40px',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                          onError={(e) => {
                            // Fallback vers les initiales si l'image ne charge pas
                            const container = (e.target as HTMLImageElement).parentElement;
                            if (container) {
                              const initiales = prestation.prestataire.prenom.charAt(0).toUpperCase() + 
                                              prestation.prestataire.nom.charAt(0).toUpperCase();
                              container.innerHTML = `
                                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                     style="width: 40px; height: 40px; font-size: 1.2rem;">
                                  ${initiales}
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        // Fallback vers les initiales si pas de photo de profil
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                          style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                        >
                          {prestation.prestataire.prenom.charAt(0).toUpperCase()}
                          {prestation.prestataire.nom.charAt(0).toUpperCase()}
                        </div>
                      );
                    })()}
                    <div>
                      <strong className="d-block">
                        {prestation.prestataire.prenom} {prestation.prestataire.nom.charAt(0).toUpperCase()}.
                      </strong>
                      <div>
                        {/* Composant NoteMoyenne réutilisé */}
                        <NoteMoyenne 
                          note={prestation.prestataire.noteMoyenne || 0} 
                          nombreEvaluations={0} // TODO: Récupérer le vrai nombre d'évaluations
                          typeService="PRESTATION"
                          size="sm"
                          showDetails={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prix et date */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="h6 text-success mb-0">
                    <i className="bi bi-currency-euro me-1"></i>
                    {prestation.prix}€
                  </span>
                </div>
                <small className="text-muted">
                  {formatDate(prestation.dateCreation)}
                </small>
              </div>
              
              {/* Actions */}
              <div className="mt-auto">
                <div className="d-flex gap-2 flex-wrap">
                  {/* Bouton "Marquer terminée" - uniquement pour les clients et prestations réservées */}
                  {peutMarquerTerminee() && (
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={handleMarquerTerminee}
                      disabled={isLoading}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      {isLoading ? 'En cours...' : 'Marquer terminée'}
                    </Button>
                  )}

                  {/* Bouton "Donner une note" - uniquement pour les clients et prestations terminées */}
                  {peutEvaluer() && (
                    <Button 
                      variant="warning" 
                      size="sm"
                      onClick={handleEvaluer}
                    >
                      <i className="bi bi-star me-1"></i>
                      Donner une note
                    </Button>
                  )}
                  
                  {/* Bouton "Annuler" - uniquement pour les clients et prestations réservées */}
                  {prestation.statut === 'RESERVEE' && currentUser.id === prestation.client.id && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Annuler
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                  >
                    <i className="bi bi-eye me-1"></i>
                    Détails
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal d'évaluation */}
      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        evalueId={prestation.prestataire.id}
        serviceType="PRESTATION"
        serviceId={prestation.id}
        evaluateurId={currentUser.id}
        evalueNom={`${prestation.prestataire.prenom} ${prestation.prestataire.nom}`}
        serviceTitre={prestation.titre}
        onEvaluationSubmitted={handleEvaluationSubmitted}
      />
    </>
  );
};

export default PrestationCard;
