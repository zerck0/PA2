package com.ecodeli.backend.controller;

import com.ecodeli.model.Livreur;
import com.ecodeli.backend.repository.LivreurRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/livreurs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class LivreurController {

    private final LivreurRepository livreurRepository;

    public LivreurController(LivreurRepository livreurRepository) {
        this.livreurRepository = livreurRepository;
    }

    @GetMapping
    public List<Livreur> getAll() {
        return livreurRepository.findAll();
    }

    @PostMapping
    public Livreur create(@RequestBody Livreur livreur) {
        return livreurRepository.save(livreur);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        livreurRepository.deleteById(id);
    }

    @GetMapping("/count")
    public long countLivreurs() {
        return livreurRepository.count();
    }

    // === GESTION DE L'AFFILIATION ===
    
    @PostMapping("/{id}/demander-affiliation")
    public ResponseEntity<?> demanderAffiliation(@PathVariable Long id, @RequestBody(required = false) String commentaire) {
        Optional<Livreur> livreurOpt = livreurRepository.findById(id);
        
        if (livreurOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Livreur livreur = livreurOpt.get();
        
        // Vérifier que le livreur n'a pas déjà une demande en cours ou n'est pas déjà affilié
        if (livreur.getStatutAffiliation() == Livreur.StatutAffiliation.DEMANDE_AFFILIATION) {
            return ResponseEntity.badRequest().body("Une demande d'affiliation est déjà en cours");
        }
        
        if (livreur.getStatutAffiliation() == Livreur.StatutAffiliation.AFFILIE) {
            return ResponseEntity.badRequest().body("Vous êtes déjà livreur affilié");
        }
        
        // Mettre à jour le statut
        livreur.setStatutAffiliation(Livreur.StatutAffiliation.DEMANDE_AFFILIATION);
        livreur.setDateDemandeAffiliation(LocalDateTime.now());
        livreur.setCommentaireAffiliation(commentaire);
        
        livreurRepository.save(livreur);
        
        return ResponseEntity.ok().body("Demande d'affiliation envoyée avec succès");
    }
    
    @GetMapping("/{id}/statut-affiliation")
    public ResponseEntity<?> getStatutAffiliation(@PathVariable Long id) {
        Optional<Livreur> livreurOpt = livreurRepository.findById(id);
        
        if (livreurOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Livreur livreur = livreurOpt.get();
        
        return ResponseEntity.ok().body(new StatutAffiliationResponse(
            livreur.getStatutAffiliation(),
            livreur.getDateDemandeAffiliation(),
            livreur.getDateValidationAffiliation(),
            livreur.getCommentaireAffiliation()
        ));
    }
    
    @PutMapping("/{id}/valider-affiliation")
    public ResponseEntity<?> validerAffiliation(@PathVariable Long id, @RequestParam boolean valider, @RequestParam(required = false) String commentaire) {
        Optional<Livreur> livreurOpt = livreurRepository.findById(id);
        
        if (livreurOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Livreur livreur = livreurOpt.get();
        
        // Vérifier qu'il y a une demande en cours
        if (livreur.getStatutAffiliation() != Livreur.StatutAffiliation.DEMANDE_AFFILIATION) {
            return ResponseEntity.badRequest().body("Aucune demande d'affiliation en cours");
        }
        
        // Mettre à jour le statut selon la décision
        if (valider) {
            livreur.setStatutAffiliation(Livreur.StatutAffiliation.AFFILIE);
        } else {
            livreur.setStatutAffiliation(Livreur.StatutAffiliation.AFFILIATION_REFUSEE);
        }
        
        livreur.setDateValidationAffiliation(LocalDateTime.now());
        livreur.setCommentaireAffiliation(commentaire);
        
        livreurRepository.save(livreur);
        
        return ResponseEntity.ok().body(valider ? "Affiliation validée" : "Affiliation refusée");
    }
    
    // Classe pour la réponse du statut d'affiliation
    public static class StatutAffiliationResponse {
        private Livreur.StatutAffiliation statut;
        private LocalDateTime dateDemandeAffiliation;
        private LocalDateTime dateValidationAffiliation;
        private String commentaire;
        
        public StatutAffiliationResponse(Livreur.StatutAffiliation statut, LocalDateTime dateDemandeAffiliation, LocalDateTime dateValidationAffiliation, String commentaire) {
            this.statut = statut;
            this.dateDemandeAffiliation = dateDemandeAffiliation;
            this.dateValidationAffiliation = dateValidationAffiliation;
            this.commentaire = commentaire;
        }
        
        // Getters
        public Livreur.StatutAffiliation getStatut() { return statut; }
        public LocalDateTime getDateDemandeAffiliation() { return dateDemandeAffiliation; }
        public LocalDateTime getDateValidationAffiliation() { return dateValidationAffiliation; }
        public String getCommentaire() { return commentaire; }
    }
}
