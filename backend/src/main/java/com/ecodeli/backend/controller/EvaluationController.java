package com.ecodeli.backend.controller;

import com.ecodeli.backend.service.EvaluationService;
import com.ecodeli.model.Evaluation;
import com.ecodeli.model.TypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "http://localhost:5173")
public class EvaluationController {
    
    @Autowired
    private EvaluationService evaluationService;
    
    /**
     * Créer une nouvelle évaluation
     */
    @PostMapping
    public ResponseEntity<?> creerEvaluation(@RequestBody CreerEvaluationRequest request) {
        try {
            Evaluation evaluation = evaluationService.creerEvaluation(
                request.getEvaluateurId(),
                request.getEvalueId(),
                request.getServiceType(),
                request.getServiceId(),
                request.getNote(),
                request.getCommentaire()
            );
            
            return ResponseEntity.ok(evaluation);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la création de l'évaluation"));
        }
    }
    
    /**
     * Vérifier si une évaluation existe déjà
     */
    @GetMapping("/existe")
    public ResponseEntity<Boolean> evaluationExiste(
            @RequestParam Long evaluateurId,
            @RequestParam TypeService serviceType,
            @RequestParam Long serviceId) {
        
        boolean existe = evaluationService.evaluationExiste(evaluateurId, serviceType, serviceId);
        return ResponseEntity.ok(existe);
    }
    
    /**
     * Récupérer les évaluations données par un utilisateur
     */
    @GetMapping("/donnees/{evaluateurId}")
    public ResponseEntity<List<Evaluation>> getEvaluationsDonnees(@PathVariable Long evaluateurId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsDonnees(evaluateurId);
        return ResponseEntity.ok(evaluations);
    }
    
    /**
     * Récupérer les évaluations reçues par un utilisateur
     */
    @GetMapping("/recues/{evalueId}")
    public ResponseEntity<List<Evaluation>> getEvaluationsRecues(@PathVariable Long evalueId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsRecues(evalueId);
        return ResponseEntity.ok(evaluations);
    }
    
    /**
     * Récupérer les évaluations d'un service spécifique
     */
    @GetMapping("/service")
    public ResponseEntity<List<Evaluation>> getEvaluationsService(
            @RequestParam TypeService serviceType,
            @RequestParam Long serviceId) {
        
        List<Evaluation> evaluations = evaluationService.getEvaluationsService(serviceType, serviceId);
        return ResponseEntity.ok(evaluations);
    }
    
    /**
     * Récupérer la note moyenne d'un utilisateur
     */
    @GetMapping("/moyenne/{evalueId}")
    public ResponseEntity<Double> getNoteMoyenne(@PathVariable Long evalueId) {
        Double moyenne = evaluationService.getNoteMoyenne(evalueId);
        return ResponseEntity.ok(moyenne);
    }
    
    /**
     * Récupérer la note moyenne par type de service
     */
    @GetMapping("/moyenne/{evalueId}/{serviceType}")
    public ResponseEntity<Double> getNoteMoyenneParService(
            @PathVariable Long evalueId,
            @PathVariable TypeService serviceType) {
        
        Double moyenne = evaluationService.getNoteMoyenneParService(evalueId, serviceType);
        return ResponseEntity.ok(moyenne);
    }
    
    /**
     * Récupérer le nombre d'évaluations d'un utilisateur
     */
    @GetMapping("/nombre/{evalueId}")
    public ResponseEntity<Long> getNombreEvaluations(@PathVariable Long evalueId) {
        Long nombre = evaluationService.getNombreEvaluations(evalueId);
        return ResponseEntity.ok(nombre);
    }
    
    /**
     * Récupérer les statistiques complètes d'un utilisateur
     */
    @GetMapping("/statistiques/{evalueId}")
    public ResponseEntity<EvaluationService.StatistiquesEvaluation> getStatistiques(@PathVariable Long evalueId) {
        EvaluationService.StatistiquesEvaluation stats = evaluationService.getStatistiques(evalueId);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Récupérer les dernières évaluations (limitées)
     */
    @GetMapping("/dernieres/{evalueId}")
    public ResponseEntity<List<Evaluation>> getDernieresEvaluations(
            @PathVariable Long evalueId,
            @RequestParam(defaultValue = "5") int limite) {
        
        List<Evaluation> evaluations = evaluationService.getDernieresEvaluations(evalueId, limite);
        return ResponseEntity.ok(evaluations);
    }
    
    /**
     * Modifier une évaluation existante
     */
    @PutMapping("/{evaluationId}")
    public ResponseEntity<?> modifierEvaluation(
            @PathVariable Long evaluationId,
            @RequestBody ModifierEvaluationRequest request) {
        
        try {
            Evaluation evaluation = evaluationService.modifierEvaluation(
                evaluationId,
                request.getNote(),
                request.getCommentaire()
            );
            
            return ResponseEntity.ok(evaluation);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la modification de l'évaluation"));
        }
    }
    
    /**
     * Supprimer une évaluation
     */
    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<?> supprimerEvaluation(@PathVariable Long evaluationId) {
        try {
            evaluationService.supprimerEvaluation(evaluationId);
            return ResponseEntity.ok(Map.of("message", "Évaluation supprimée avec succès"));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la suppression de l'évaluation"));
        }
    }
    
    /**
     * Récupérer une évaluation par ID
     */
    @GetMapping("/{evaluationId}")
    public ResponseEntity<?> getEvaluationById(@PathVariable Long evaluationId) {
        return evaluationService.getEvaluationById(evaluationId)
                .map(evaluation -> ResponseEntity.ok(evaluation))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Classes internes pour les requêtes
    public static class CreerEvaluationRequest {
        private Long evaluateurId;
        private Long evalueId;
        private TypeService serviceType;
        private Long serviceId;
        private Integer note;
        private String commentaire;
        
        // Constructeur par défaut
        public CreerEvaluationRequest() {}
        
        // Getters et Setters
        public Long getEvaluateurId() { return evaluateurId; }
        public void setEvaluateurId(Long evaluateurId) { this.evaluateurId = evaluateurId; }
        
        public Long getEvalueId() { return evalueId; }
        public void setEvalueId(Long evalueId) { this.evalueId = evalueId; }
        
        public TypeService getServiceType() { return serviceType; }
        public void setServiceType(TypeService serviceType) { this.serviceType = serviceType; }
        
        public Long getServiceId() { return serviceId; }
        public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
        
        public Integer getNote() { return note; }
        public void setNote(Integer note) { this.note = note; }
        
        public String getCommentaire() { return commentaire; }
        public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
    }
    
    public static class ModifierEvaluationRequest {
        private Integer note;
        private String commentaire;
        
        // Constructeur par défaut
        public ModifierEvaluationRequest() {}
        
        // Getters et Setters
        public Integer getNote() { return note; }
        public void setNote(Integer note) { this.note = note; }
        
        public String getCommentaire() { return commentaire; }
        public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
    }
}
