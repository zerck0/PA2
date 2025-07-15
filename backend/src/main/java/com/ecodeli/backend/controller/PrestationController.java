package com.ecodeli.backend.controller;

import com.ecodeli.model.*;
import com.ecodeli.backend.service.PrestationService;
import com.ecodeli.backend.service.PrestataireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prestations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class PrestationController {

    @Autowired
    private PrestationService prestationService;
    
    @Autowired
    private PrestataireService prestataireService;

    /**
     * Créer une réservation de prestation
     */
    @PostMapping("/reserver")
    public ResponseEntity<?> creerReservation(@RequestBody Map<String, Object> requestData) {
        try {
            Long prestataireId = Long.valueOf(requestData.get("prestataireId").toString());
            Long clientId = Long.valueOf(requestData.get("clientId").toString());
            
            // Parser les dates
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime dateDebut = LocalDateTime.parse(requestData.get("dateDebut").toString(), formatter);
            LocalDateTime dateFin = LocalDateTime.parse(requestData.get("dateFin").toString(), formatter);
            
            // Type de prestation
            String typeStr = requestData.get("typePrestation").toString();
            Prestation.TypePrestation typePrestation = Prestation.TypePrestation.valueOf(typeStr);
            
            // Nouveaux champs
            String titre = requestData.get("titre").toString();
            String description = requestData.get("description").toString();
            Double prix = Double.valueOf(requestData.get("prix").toString());
            
            // Adresse
            String adresse = requestData.get("adresse").toString();
            String ville = requestData.get("ville").toString();
            String codePostal = requestData.get("codePostal").toString();
            
            Prestation prestation = prestationService.creerReservation(
                prestataireId, clientId, dateDebut, dateFin, 
                typePrestation, titre, description, prix, adresse, ville, codePostal
            );
            
            return ResponseEntity.ok(prestation);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Récupérer les prestations d'un prestataire
     */
    @GetMapping("/prestataire/{prestataireId}")
    public ResponseEntity<List<Prestation>> getPrestationsPrestataire(@PathVariable Long prestataireId) {
        try {
            List<Prestation> prestations = prestationService.getPrestationsPrestataire(prestataireId);
            return ResponseEntity.ok(prestations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Récupérer les prestations d'un client
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Prestation>> getPrestationsClient(@PathVariable Long clientId) {
        try {
            List<Prestation> prestations = prestationService.getPrestationsClient(clientId);
            return ResponseEntity.ok(prestations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Récupérer les disponibilités d'un prestataire
     */
    @GetMapping("/prestataire/{prestataireId}/disponibilites")
    public ResponseEntity<List<PlageDisponibilite>> getDisponibilites(@PathVariable Long prestataireId) {
        try {
            List<PlageDisponibilite> disponibilites = prestationService.getDisponibilites(prestataireId);
            return ResponseEntity.ok(disponibilites);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Configurer les disponibilités d'un prestataire
     */
    @PostMapping("/prestataire/{prestataireId}/disponibilites")
    public ResponseEntity<?> configurerDisponibilites(
            @PathVariable Long prestataireId, 
            @RequestBody List<PlageDisponibilite> plages) {
        try {
            prestationService.configurerDisponibilites(prestataireId, plages);
            return ResponseEntity.ok(Map.of("message", "Disponibilités mises à jour avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Vérifier la disponibilité d'un prestataire
     */
    @PostMapping("/prestataire/{prestataireId}/verifier-disponibilite")
    public ResponseEntity<?> verifierDisponibilite(
            @PathVariable Long prestataireId,
            @RequestBody Map<String, String> requestData) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime dateDebut = LocalDateTime.parse(requestData.get("dateDebut"), formatter);
            LocalDateTime dateFin = LocalDateTime.parse(requestData.get("dateFin"), formatter);
            
            // Récupérer le prestataire (simplifié pour l'exemple)
            // En réalité, il faudrait injecter PrestataireRepository
            // boolean disponible = prestationService.isPrestataireDisponible(prestataire, dateDebut, dateFin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("disponible", true); // Temporaire
            response.put("message", "Créneau disponible");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Annuler une prestation
     */
    @PutMapping("/{prestationId}/annuler")
    public ResponseEntity<?> annulerPrestation(
            @PathVariable Long prestationId,
            @RequestParam Long utilisateurId) {
        try {
            prestationService.annulerPrestation(prestationId, utilisateurId);
            return ResponseEntity.ok(Map.of("message", "Prestation annulée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Marquer une prestation comme terminée (action du client)
     */
    @PutMapping("/{prestationId}/marquer-terminee")
    public ResponseEntity<?> marquerPrestationTerminee(
            @PathVariable Long prestationId,
            @RequestParam Long clientId) {
        try {
            prestationService.marquerPrestationTerminee(prestationId, clientId);
            return ResponseEntity.ok(Map.of("message", "Prestation marquée comme terminée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Marquer une prestation comme évaluée (appelé après notation)
     */
    @PutMapping("/{prestationId}/marquer-evaluee")
    public ResponseEntity<?> marquerPrestationEvaluee(@PathVariable Long prestationId) {
        try {
            prestationService.marquerPrestationEvaluee(prestationId);
            return ResponseEntity.ok(Map.of("message", "Prestation marquée comme évaluée"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Récupérer les revenus mensuels d'un prestataire
     */
    @GetMapping("/prestataire/{prestataireId}/revenus")
    public ResponseEntity<?> getRevenusMensuel(
            @PathVariable Long prestataireId,
            @RequestParam int annee,
            @RequestParam int mois) {
        try {
            double revenus = prestationService.getRevenusMensuel(prestataireId, annee, mois);
            return ResponseEntity.ok(Map.of("revenus", revenus));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Récupérer les types de prestations disponibles
     */
    @GetMapping("/types")
    public ResponseEntity<Prestation.TypePrestation[]> getTypesPrestations() {
        return ResponseEntity.ok(Prestation.TypePrestation.values());
    }

    /**
     * Récupérer les statuts de prestations
     */
    @GetMapping("/statuts")
    public ResponseEntity<Prestation.StatutPrestation[]> getStatutsPrestations() {
        return ResponseEntity.ok(Prestation.StatutPrestation.values());
    }

    /**
     * Configurer le profil d'un prestataire
     */
    @PostMapping("/prestataire/{prestataireId}/configurer-profil")
    public ResponseEntity<?> configurerProfilPrestataire(
            @PathVariable Long prestataireId,
            @RequestBody Map<String, Object> profilData) {
        try {
            prestataireService.configurerProfilPrestataire(prestataireId, profilData);
            return ResponseEntity.ok(Map.of("message", "Profil configuré avec succès"));
        } catch (RuntimeException e) {
            // Erreurs métier (prestataire non trouvé, données invalides)
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Erreurs techniques
            return ResponseEntity.internalServerError().body(Map.of("message", "Erreur interne du serveur"));
        }
    }

    /**
     * Récupérer le profil d'un prestataire
     */
    @GetMapping("/prestataire/{prestataireId}/profil")
    public ResponseEntity<?> getProfilPrestataire(@PathVariable Long prestataireId) {
        try {
            Map<String, Object> profil = prestataireService.getProfilPrestataire(prestataireId);
            return ResponseEntity.ok(profil);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Récupérer les catégories de prestations groupées
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        Map<String, List<Map<String, String>>> categories = new HashMap<>();
        
        for (Prestation.TypePrestation type : Prestation.TypePrestation.values()) {
            String categorie = type.getCategorie();
            categories.computeIfAbsent(categorie, k -> new ArrayList<>())
                     .add(Map.of("value", type.name(), "label", type.getLibelle()));
        }
        
        return ResponseEntity.ok(categories);
    }

    /**
     * Récupérer toutes les prestations disponibles (prestataires avec profils configurés)
     */
    @GetMapping("/disponibles")
    public ResponseEntity<?> getPrestationsDisponibles(@RequestParam(required = false) String typeService) {
        try {
            List<Map<String, Object>> prestationsDisponibles = prestataireService.getPrestationsDisponibles(typeService);
            return ResponseEntity.ok(prestationsDisponibles);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
