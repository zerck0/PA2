package com.ecodeli.backend.repository;

import com.ecodeli.model.Prestation;
import com.ecodeli.model.Prestataire;
import com.ecodeli.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PrestationRepository extends JpaRepository<Prestation, Long> {
    
    // Trouver les prestations d'un prestataire
    List<Prestation> findByPrestataireOrderByDateDebutDesc(Prestataire prestataire);
    
    // Trouver les prestations d'un client
    List<Prestation> findByClientOrderByDateDebutDesc(Client client);
    
    // Trouver les prestations par statut
    List<Prestation> findByStatut(Prestation.StatutPrestation statut);
    
    // Vérifier les conflits de créneaux pour un prestataire
    @Query("SELECT p FROM Prestation p WHERE p.prestataire = :prestataire " +
           "AND p.statut IN ('EN_ATTENTE', 'ACCEPTEE', 'EN_COURS') " +
           "AND ((p.dateDebut BETWEEN :debut AND :fin) " +
           "OR (p.dateFin BETWEEN :debut AND :fin) " +
           "OR (p.dateDebut <= :debut AND p.dateFin >= :fin))")
    List<Prestation> findConflictingPrestations(
        @Param("prestataire") Prestataire prestataire,
        @Param("debut") LocalDateTime debut,
        @Param("fin") LocalDateTime fin
    );
    
    // Prestations d'un prestataire pour une période donnée
    @Query("SELECT p FROM Prestation p WHERE p.prestataire = :prestataire " +
           "AND p.dateDebut BETWEEN :debut AND :fin " +
           "ORDER BY p.dateDebut")
    List<Prestation> findByPrestataireAndPeriode(
        @Param("prestataire") Prestataire prestataire,
        @Param("debut") LocalDateTime debut,
        @Param("fin") LocalDateTime fin
    );
    
    // Prestations en attente pour un prestataire
    @Query("SELECT p FROM Prestation p WHERE p.prestataire = :prestataire " +
           "AND p.statut = 'EN_ATTENTE' " +
           "ORDER BY p.dateCreation DESC")
    List<Prestation> findPrestationsEnAttente(@Param("prestataire") Prestataire prestataire);
    
    // Revenus d'un prestataire pour un mois donné
    @Query("SELECT COALESCE(SUM(p.prix), 0.0) FROM Prestation p " +
           "WHERE p.prestataire = :prestataire " +
           "AND p.statut = 'TERMINEE' " +
           "AND YEAR(p.dateDebut) = :annee " +
           "AND MONTH(p.dateDebut) = :mois")
    Double calculateRevenusMensuel(
        @Param("prestataire") Prestataire prestataire,
        @Param("annee") int annee,
        @Param("mois") int mois
    );
    
    // Nombre de prestations terminées pour un prestataire
    @Query("SELECT COUNT(p) FROM Prestation p " +
           "WHERE p.prestataire = :prestataire " +
           "AND p.statut = 'TERMINEE'")
    Long countPrestationsTerminees(@Param("prestataire") Prestataire prestataire);
}
