package com.ecodeli.backend.service;

import com.ecodeli.backend.repository.EvaluationRepository;
import com.ecodeli.model.Evaluation;
import com.ecodeli.model.TypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EvaluationService {
    
    @Autowired
    private EvaluationRepository evaluationRepository;
    
    /**
     * Créer une nouvelle évaluation
     */
    public Evaluation creerEvaluation(Long evaluateurId, Long evalueId, TypeService serviceType, 
                                    Long serviceId, Integer note, String commentaire) {
        
        // Validation des paramètres
        if (evaluateurId == null || evalueId == null || serviceType == null || 
            serviceId == null || note == null) {
            throw new IllegalArgumentException("Tous les paramètres obligatoires doivent être fournis");
        }
        
        if (note < 1 || note > 5) {
            throw new IllegalArgumentException("La note doit être comprise entre 1 et 5");
        }
        
        if (evaluateurId.equals(evalueId)) {
            throw new IllegalArgumentException("Un utilisateur ne peut pas s'auto-évaluer");
        }
        
        // Créer l'évaluation
        Evaluation evaluation = new Evaluation(evaluateurId, evalueId, serviceType, serviceId, note, commentaire);
        evaluation.setDateEvaluation(LocalDateTime.now());
        
        return evaluationRepository.save(evaluation);
    }
    
    /**
     * Vérifier si une évaluation existe déjà
     */
    public boolean evaluationExiste(Long evaluateurId, TypeService serviceType, Long serviceId) {
        return evaluationRepository.findByEvaluateurIdAndServiceTypeAndServiceId(
            evaluateurId, serviceType, serviceId).isPresent();
    }
    
    /**
     * Récupérer toutes les évaluations données par un utilisateur
     */
    public List<Evaluation> getEvaluationsDonnees(Long evaluateurId) {
        return evaluationRepository.findByEvaluateurIdOrderByDateEvaluationDesc(evaluateurId);
    }
    
    /**
     * Récupérer toutes les évaluations reçues par un utilisateur
     */
    public List<Evaluation> getEvaluationsRecues(Long evalueId) {
        return evaluationRepository.findByEvalueIdOrderByDateEvaluationDesc(evalueId);
    }
    
    /**
     * Récupérer les évaluations d'un service spécifique
     */
    public List<Evaluation> getEvaluationsService(TypeService serviceType, Long serviceId) {
        return evaluationRepository.findByServiceTypeAndServiceId(serviceType, serviceId);
    }
    
    /**
     * Calculer la note moyenne d'un utilisateur (tous services confondus)
     */
    public Double getNoteMoyenne(Long evalueId) {
        return evaluationRepository.findNoteMoyenneByEvalueId(evalueId).orElse(0.0);
    }
    
    /**
     * Calculer la note moyenne d'un utilisateur pour un type de service spécifique
     */
    public Double getNoteMoyenneParService(Long evalueId, TypeService serviceType) {
        return evaluationRepository.findNoteMoyenneByEvalueIdAndServiceType(evalueId, serviceType)
                .orElse(0.0);
    }
    
    /**
     * Compter le nombre total d'évaluations reçues
     */
    public Long getNombreEvaluations(Long evalueId) {
        return evaluationRepository.countByEvalueId(evalueId);
    }
    
    /**
     * Compter le nombre d'évaluations reçues pour un type de service
     */
    public Long getNombreEvaluationsParService(Long evalueId, TypeService serviceType) {
        return evaluationRepository.countByEvalueIdAndServiceType(evalueId, serviceType);
    }
    
    /**
     * Récupérer les dernières évaluations (limitées)
     */
    public List<Evaluation> getDernieresEvaluations(Long evalueId, int limite) {
        List<Evaluation> evaluations = evaluationRepository.findTopEvaluationsByEvalueId(evalueId);
        
        // Limiter le nombre de résultats
        if (evaluations.size() > limite) {
            return evaluations.subList(0, limite);
        }
        
        return evaluations;
    }
    
    /**
     * Mettre à jour une évaluation existante
     */
    public Evaluation modifierEvaluation(Long evaluationId, Integer nouvelleNote, String nouveauCommentaire) {
        Optional<Evaluation> evaluationOpt = evaluationRepository.findById(evaluationId);
        
        if (evaluationOpt.isEmpty()) {
            throw new IllegalArgumentException("Évaluation non trouvée");
        }
        
        if (nouvelleNote != null && (nouvelleNote < 1 || nouvelleNote > 5)) {
            throw new IllegalArgumentException("La note doit être comprise entre 1 et 5");
        }
        
        Evaluation evaluation = evaluationOpt.get();
        
        if (nouvelleNote != null) {
            evaluation.setNote(nouvelleNote);
        }
        
        if (nouveauCommentaire != null) {
            evaluation.setCommentaire(nouveauCommentaire);
        }
        
        return evaluationRepository.save(evaluation);
    }
    
    /**
     * Supprimer une évaluation
     */
    public void supprimerEvaluation(Long evaluationId) {
        if (!evaluationRepository.existsById(evaluationId)) {
            throw new IllegalArgumentException("Évaluation non trouvée");
        }
        
        evaluationRepository.deleteById(evaluationId);
    }
    
    /**
     * Récupérer une évaluation par ID
     */
    public Optional<Evaluation> getEvaluationById(Long evaluationId) {
        return evaluationRepository.findById(evaluationId);
    }
    
    /**
     * Calculer les statistiques d'évaluation pour un utilisateur
     */
    public StatistiquesEvaluation getStatistiques(Long evalueId) {
        Long totalEvaluations = getNombreEvaluations(evalueId);
        Double noteMoyenne = getNoteMoyenne(evalueId);
        Double noteMoyennePrestation = getNoteMoyenneParService(evalueId, TypeService.PRESTATION);
        Double noteMoyenneLivraison = getNoteMoyenneParService(evalueId, TypeService.LIVRAISON);
        Long nombrePrestations = getNombreEvaluationsParService(evalueId, TypeService.PRESTATION);
        Long nombreLivraisons = getNombreEvaluationsParService(evalueId, TypeService.LIVRAISON);
        
        return new StatistiquesEvaluation(
            totalEvaluations,
            noteMoyenne,
            noteMoyennePrestation,
            noteMoyenneLivraison,
            nombrePrestations,
            nombreLivraisons
        );
    }
    
    /**
     * Classe interne pour les statistiques
     */
    public static class StatistiquesEvaluation {
        private final Long totalEvaluations;
        private final Double noteMoyenne;
        private final Double noteMoyennePrestation;
        private final Double noteMoyenneLivraison;
        private final Long nombrePrestations;
        private final Long nombreLivraisons;
        
        public StatistiquesEvaluation(Long totalEvaluations, Double noteMoyenne,
                                    Double noteMoyennePrestation, Double noteMoyenneLivraison,
                                    Long nombrePrestations, Long nombreLivraisons) {
            this.totalEvaluations = totalEvaluations;
            this.noteMoyenne = noteMoyenne;
            this.noteMoyennePrestation = noteMoyennePrestation;
            this.noteMoyenneLivraison = noteMoyenneLivraison;
            this.nombrePrestations = nombrePrestations;
            this.nombreLivraisons = nombreLivraisons;
        }
        
        // Getters
        public Long getTotalEvaluations() { return totalEvaluations; }
        public Double getNoteMoyenne() { return noteMoyenne; }
        public Double getNoteMoyennePrestation() { return noteMoyennePrestation; }
        public Double getNoteMoyenneLivraison() { return noteMoyenneLivraison; }
        public Long getNombrePrestations() { return nombrePrestations; }
        public Long getNombreLivraisons() { return nombreLivraisons; }
    }
}
