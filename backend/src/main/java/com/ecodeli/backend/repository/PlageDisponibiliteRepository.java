package com.ecodeli.backend.repository;

import com.ecodeli.model.PlageDisponibilite;
import com.ecodeli.model.Prestataire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlageDisponibiliteRepository extends JpaRepository<PlageDisponibilite, Long> {
    
    // Trouver toutes les plages d'un prestataire
    List<PlageDisponibilite> findByPrestataireOrderByJourSemaine(Prestataire prestataire);
    
    // Trouver les plages actives d'un prestataire
    List<PlageDisponibilite> findByPrestataireAndActifTrueOrderByJourSemaine(Prestataire prestataire);
    
    // Trouver une plage spécifique d'un prestataire pour un jour donné
    Optional<PlageDisponibilite> findByPrestataireAndJourSemaine(Prestataire prestataire, DayOfWeek jourSemaine);
    
    // Trouver les plages actives d'un prestataire pour un jour donné
    Optional<PlageDisponibilite> findByPrestataireAndJourSemaineAndActifTrue(Prestataire prestataire, DayOfWeek jourSemaine);
    
    // Vérifier si un prestataire a des disponibilités configurées
    @Query("SELECT COUNT(p) > 0 FROM PlageDisponibilite p WHERE p.prestataire = :prestataire AND p.actif = true")
    boolean hasActiveDisponibilites(@Param("prestataire") Prestataire prestataire);
    
    // Compter le nombre de jours travaillés par un prestataire
    @Query("SELECT COUNT(p) FROM PlageDisponibilite p WHERE p.prestataire = :prestataire AND p.actif = true")
    Long countJoursTravailles(@Param("prestataire") Prestataire prestataire);
    
    // Supprimer toutes les plages d'un prestataire
    void deleteByPrestataire(Prestataire prestataire);
}
