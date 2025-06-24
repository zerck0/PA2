package com.ecodeli.backend.repository;

import com.ecodeli.model.Annonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {
    List<Annonce> findByAuteurIdOrderByDateCreationDesc(Long auteurId);

    List<Annonce> findByStatutOrderByDateCreationDesc(Annonce.StatutAnnonce statut);

    @Query("SELECT a FROM Annonce a WHERE a.statut = :statut AND " +
            "(LOWER(a.villeDepart) LIKE LOWER(CONCAT('%', :ville, '%')) OR " +
            "LOWER(a.villeArrivee) LIKE LOWER(CONCAT('%', :ville, '%')))")
    List<Annonce> findActiveAnnoncesByVille(@Param("ville") String ville, @Param("statut") Annonce.StatutAnnonce statut);

    @Query("SELECT a FROM Annonce a WHERE a.statut = :statut AND a.type = :type")
    List<Annonce> findActiveAnnoncesByType(@Param("type") Annonce.TypeAnnonce type, @Param("statut") Annonce.StatutAnnonce statut);
    
    List<Annonce> findByLivreurAssigneIdOrderByDateCreationDesc(Long livreurId);
}
