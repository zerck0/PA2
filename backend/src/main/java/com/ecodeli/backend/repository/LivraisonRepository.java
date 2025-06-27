package com.ecodeli.backend.repository;

import com.ecodeli.model.Livraison;
import com.ecodeli.model.Annonce;
import com.ecodeli.model.Livreur;
import com.ecodeli.model.Entrepot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivraisonRepository extends JpaRepository<Livraison, Long> {

    // Recherche par annonce
    List<Livraison> findByAnnonceOrderByOrdre(Annonce annonce);
    List<Livraison> findByAnnonceId(Long annonceId);

    // Recherche par livreur
    List<Livraison> findByLivreur(Livreur livreur);
    List<Livraison> findByLivreurId(Long livreurId);

    // Recherche par statut
    List<Livraison> findByStatut(Livraison.StatutLivraison statut);

    // Recherche par type de livraison
    List<Livraison> findByTypeLivraison(Livraison.TypeLivraison typeLivraison);

    // Recherche par entrepôt
    List<Livraison> findByEntrepot(Entrepot entrepot);
    List<Livraison> findByEntrepotId(Long entrepotId);

    // Livraisons en cours pour un livreur
    @Query("SELECT l FROM Livraison l WHERE l.livreur.id = :livreurId AND l.statut IN ('ACCEPTEE', 'EN_COURS')")
    List<Livraison> findLivraisonsEnCoursByLivreur(@Param("livreurId") Long livreurId);

    // Livraisons disponibles (en attente et sans livreur assigné)
    @Query("SELECT l FROM Livraison l WHERE l.statut = 'EN_ATTENTE' AND (l.livreur IS NULL OR l.typeLivraison = 'PARTIELLE_RETRAIT') ORDER BY l.dateCreation")
    List<Livraison> findLivraisonsDisponibles();

    // Livraisons partielles d'une annonce
    @Query("SELECT l FROM Livraison l WHERE l.annonce.id = :annonceId AND l.typeLivraison IN ('PARTIELLE_DEPOT', 'PARTIELLE_RETRAIT') ORDER BY l.ordre")
    List<Livraison> findLivraisonsPartiellesByAnnonce(@Param("annonceId") Long annonceId);

    // Colis stockés dans un entrepôt
    @Query("SELECT l FROM Livraison l WHERE l.entrepot.id = :entrepotId AND l.statut = 'STOCKEE'")
    List<Livraison> findColisStockesInEntrepot(@Param("entrepotId") Long entrepotId);

    // Livraison par code de validation
    Optional<Livraison> findByCodeValidation(String codeValidation);

    // Statistiques
    @Query("SELECT COUNT(l) FROM Livraison l WHERE l.statut = :statut")
    Long countByStatut(@Param("statut") Livraison.StatutLivraison statut);

    @Query("SELECT COUNT(l) FROM Livraison l WHERE l.typeLivraison = :type")
    Long countByType(@Param("type") Livraison.TypeLivraison type);

    // Vérifier si une annonce a déjà des livraisons
    @Query("SELECT COUNT(l) > 0 FROM Livraison l WHERE l.annonce.id = :annonceId")
    boolean hasLivraisonsByAnnonce(@Param("annonceId") Long annonceId);
}
