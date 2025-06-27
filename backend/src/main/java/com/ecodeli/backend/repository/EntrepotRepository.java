package com.ecodeli.backend.repository;

import com.ecodeli.model.Entrepot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntrepotRepository extends JpaRepository<Entrepot, Long> {

    List<Entrepot> findByStatut(Entrepot.StatutEntrepot statut);

    List<Entrepot> findByVilleContainingIgnoreCase(String ville);

    Optional<Entrepot> findByNomIgnoreCase(String nom);

    @Query("SELECT e FROM Entrepot e WHERE e.statut = 'ACTIF' ORDER BY e.ville")
    List<Entrepot> findAllActiveOrderByVille();

    @Query("SELECT e FROM Entrepot e WHERE e.ville = :ville AND e.statut = 'ACTIF'")
    List<Entrepot> findActiveByVille(@Param("ville") String ville);

    // Pour les statistiques
    @Query("SELECT COUNT(e) FROM Entrepot e WHERE e.statut = 'ACTIF'")
    Long countActiveEntrepots();
}
