package com.ecodeli.backend.service;

import com.ecodeli.model.*;
import com.ecodeli.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PrestationService {

    @Autowired
    private PrestationRepository prestationRepository;

    @Autowired
    private PlageDisponibiliteRepository plageDisponibiliteRepository;

    @Autowired
    private PrestataireRepository prestataireRepository;

    @Autowired
    private ClientRepository clientRepository;

    /**
     * Créer une réservation de prestation
     */
    public Prestation creerReservation(Long prestataireId, Long clientId, 
                                      LocalDateTime dateDebut, LocalDateTime dateFin, 
                                      Prestation.TypePrestation typePrestation,
                                      String titre, String description, Double prix,
                                      String adresse, String ville, String codePostal) {
        
        // Vérifications préliminaires
        Prestataire prestataire = prestataireRepository.findById(prestataireId)
            .orElseThrow(() -> new RuntimeException("Prestataire non trouvé"));
        
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        
        // Vérifier que le prestataire est validé
        if (!prestataire.isVerifDossier()) {
            throw new RuntimeException("Le prestataire n'est pas encore validé");
        }
        
        // Vérifier la durée minimum (1 heure)
        Duration duree = Duration.between(dateDebut, dateFin);
        if (duree.toHours() < 1) {
            throw new RuntimeException("La durée minimum d'une prestation est de 1 heure");
        }
        
        // Vérifier le délai de réservation (au moins 1 heure à l'avance)
        if (dateDebut.isBefore(LocalDateTime.now().plusHours(1))) {
            throw new RuntimeException("Les réservations doivent être faites au moins 1 heure à l'avance");
        }
        
        // Vérifier la disponibilité du prestataire
        if (!isPrestataireDisponible(prestataire, dateDebut, dateFin)) {
            throw new RuntimeException("Le prestataire n'est pas disponible sur ce créneau");
        }
        
        // Vérifier les conflits avec d'autres prestations
        List<Prestation> conflits = prestationRepository.findConflictingPrestations(
            prestataire, dateDebut, dateFin);
        if (!conflits.isEmpty()) {
            throw new RuntimeException("Ce créneau est déjà réservé");
        }
        
        // Créer la prestation
        Prestation prestation = new Prestation();
        prestation.setPrestataire(prestataire);
        prestation.setClient(client);
        prestation.setTypePrestation(typePrestation);
        prestation.setDateDebut(dateDebut);
        prestation.setDateFin(dateFin);
        prestation.setAdresse(adresse);
        prestation.setVille(ville);
        prestation.setCodePostal(codePostal);
        prestation.setPrix(prix); // Utiliser le prix fourni par le frontend
        prestation.setStatut(Prestation.StatutPrestation.RESERVEE); // Statut RESERVEE pour réservation immédiate
        prestation.setTitre(titre); // Utiliser le titre fourni par le client
        prestation.setDescription(description); // Utiliser la description fournie
        
        return prestationRepository.save(prestation);
    }
    
    /**
     * Vérifier si un prestataire est disponible sur un créneau
     */
    public boolean isPrestataireDisponible(Prestataire prestataire, LocalDateTime debut, LocalDateTime fin) {
        DayOfWeek jour = debut.getDayOfWeek();
        
        // Récupérer la plage de disponibilité pour ce jour
        Optional<PlageDisponibilite> plageOpt = plageDisponibiliteRepository
            .findByPrestataireAndJourSemaineAndActifTrue(prestataire, jour);
        
        if (plageOpt.isEmpty()) {
            return false; // Pas de disponibilité configurée pour ce jour
        }
        
        PlageDisponibilite plage = plageOpt.get();
        
        // Vérifier que le créneau est dans la plage de disponibilité
        return plage.isPlageDisponible(debut.toLocalTime(), fin.toLocalTime());
    }
    
    /**
     * Calculer le prix d'une prestation
     */
    private double calculatePrix(Prestataire prestataire, LocalDateTime debut, LocalDateTime fin) {
        Duration duree = Duration.between(debut, fin);
        double heures = duree.toMinutes() / 60.0;
        return heures * prestataire.getTarifHoraire();
    }
    
    /**
     * Configurer les disponibilités d'un prestataire
     */
    public void configurerDisponibilites(Long prestataireId, List<PlageDisponibilite> plages) {
        Prestataire prestataire = prestataireRepository.findById(prestataireId)
            .orElseThrow(() -> new RuntimeException("Prestataire non trouvé"));
        
        // Supprimer les anciennes plages
        plageDisponibiliteRepository.deleteByPrestataire(prestataire);
        
        // Créer les nouvelles plages
        for (PlageDisponibilite plage : plages) {
            plage.setPrestataire(prestataire);
            plageDisponibiliteRepository.save(plage);
        }
    }
    
    /**
     * Annuler une prestation
     */
    public void annulerPrestation(Long prestationId, Long utilisateurId) {
        Prestation prestation = prestationRepository.findById(prestationId)
            .orElseThrow(() -> new RuntimeException("Prestation non trouvée"));
        
        // Vérifier que l'utilisateur peut annuler
        boolean peutAnnuler = prestation.getPrestataire().getId().equals(utilisateurId) ||
                             prestation.getClient().getId().equals(utilisateurId);
        
        if (!peutAnnuler) {
            throw new RuntimeException("Vous n'avez pas le droit d'annuler cette prestation");
        }
        
        // Vérifier le délai d'annulation (24h avant)
        if (prestation.getDateDebut().isBefore(LocalDateTime.now().plusHours(24))) {
            throw new RuntimeException("Les annulations doivent être faites au moins 24h à l'avance");
        }
        
        prestation.setStatut(Prestation.StatutPrestation.ANNULEE);
        prestationRepository.save(prestation);
    }
    
    /**
     * Marquer une prestation comme terminée (action du client)
     */
    public void marquerPrestationTerminee(Long prestationId, Long clientId) {
        Prestation prestation = prestationRepository.findById(prestationId)
            .orElseThrow(() -> new RuntimeException("Prestation non trouvée"));
        
        // Vérifier que c'est bien le client de la prestation
        if (!prestation.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Seul le client de la prestation peut la marquer comme terminée");
        }
        
        // Vérifier que le statut est RESERVEE
        if (prestation.getStatut() != Prestation.StatutPrestation.RESERVEE) {
            throw new RuntimeException("La prestation doit être en statut RESERVEE pour être marquée terminée");
        }
        
        prestation.setStatut(Prestation.StatutPrestation.TERMINEE);
        prestation.setDateModification(LocalDateTime.now());
        prestationRepository.save(prestation);
    }
    
    /**
     * Marquer une prestation comme évaluée (appelé après notation)
     */
    public void marquerPrestationEvaluee(Long prestationId) {
        Prestation prestation = prestationRepository.findById(prestationId)
            .orElseThrow(() -> new RuntimeException("Prestation non trouvée"));
        
        // Vérifier que le statut est TERMINEE
        if (prestation.getStatut() != Prestation.StatutPrestation.TERMINEE) {
            throw new RuntimeException("La prestation doit être terminée avant d'être évaluée");
        }
        
        prestation.setStatut(Prestation.StatutPrestation.EVALUEE);
        prestation.setDateModification(LocalDateTime.now());
        prestationRepository.save(prestation);
    }
    
    /**
     * Récupérer les prestations d'un prestataire
     */
    public List<Prestation> getPrestationsPrestataire(Long prestataireId) {
        Prestataire prestataire = prestataireRepository.findById(prestataireId)
            .orElseThrow(() -> new RuntimeException("Prestataire non trouvé"));
        
        return prestationRepository.findByPrestataireOrderByDateDebutDesc(prestataire);
    }
    
    /**
     * Récupérer les prestations d'un client
     */
    public List<Prestation> getPrestationsClient(Long clientId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        
        return prestationRepository.findByClientOrderByDateDebutDesc(client);
    }
    
    /**
     * Récupérer les disponibilités d'un prestataire
     */
    public List<PlageDisponibilite> getDisponibilites(Long prestataireId) {
        Prestataire prestataire = prestataireRepository.findById(prestataireId)
            .orElseThrow(() -> new RuntimeException("Prestataire non trouvé"));
        
        return plageDisponibiliteRepository.findByPrestataireAndActifTrueOrderByJourSemaine(prestataire);
    }
    
    /**
     * Calculer les revenus mensuels d'un prestataire
     */
    public double getRevenusMensuel(Long prestataireId, int annee, int mois) {
        Prestataire prestataire = prestataireRepository.findById(prestataireId)
            .orElseThrow(() -> new RuntimeException("Prestataire non trouvé"));
        
        Double revenus = prestationRepository.calculateRevenusMensuel(prestataire, annee, mois);
        return revenus != null ? revenus : 0.0;
    }
}
