package com.ecodeli.backend.repository;

import com.ecodeli.model.Evaluation;
import com.ecodeli.model.TypeService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    
    // Rechercher toutes les évaluations données par un utilisateur (client)
    List<Evaluation> findByEvaluateurIdOrderByDateEvaluationDesc(Long evaluateurId);
    
    // Rechercher toutes les évaluations reçues par un utilisateur (prestataire/livreur)
    List<Evaluation> findByEvalueIdOrderByDateEvaluationDesc(Long evalueId);
    
    // Rechercher les évaluations d'un service spécifique
    List<Evaluation> findByServiceTypeAndServiceId(TypeService serviceType, Long serviceId);
    
    // Vérifier si une évaluation existe déjà pour un service et un évaluateur donnés
    Optional<Evaluation> findByEvaluateurIdAndServiceTypeAndServiceId(
        Long evaluateurId, TypeService serviceType, Long serviceId);
    
    // Calculer la note moyenne d'un utilisateur (prestataire/livreur)
    @Query("SELECT AVG(e.note) FROM Evaluation e WHERE e.evalueId = :evalueId")
    Optional<Double> findNoteMoyenneByEvalueId(@Param("evalueId") Long evalueId);
    
    // Calculer la note moyenne d'un utilisateur pour un type de service spécifique
    @Query("SELECT AVG(e.note) FROM Evaluation e WHERE e.evalueId = :evalueId AND e.serviceType = :serviceType")
    Optional<Double> findNoteMoyenneByEvalueIdAndServiceType(
        @Param("evalueId") Long evalueId, 
        @Param("serviceType") TypeService serviceType);
    
    // Compter le nombre total d'évaluations reçues par un utilisateur
    Long countByEvalueId(Long evalueId);
    
    // Compter le nombre d'évaluations reçues par un utilisateur pour un type de service
    Long countByEvalueIdAndServiceType(Long evalueId, TypeService serviceType);
    
    // Récupérer les dernières évaluations d'un utilisateur (avec limite)
    @Query("SELECT e FROM Evaluation e WHERE e.evalueId = :evalueId ORDER BY e.dateEvaluation DESC")
    List<Evaluation> findTopEvaluationsByEvalueId(@Param("evalueId") Long evalueId);
    
    // Récupérer les évaluations par note (pour statistiques)
    List<Evaluation> findByEvalueIdAndNote(Long evalueId, Integer note);
}
