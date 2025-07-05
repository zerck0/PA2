package com.ecodeli.backend.repository;

import com.ecodeli.model.AnnonceCommercant;
import com.ecodeli.model.Commercant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnonceCommercantRepository extends JpaRepository<AnnonceCommercant, Long> {
    
    // Trouver toutes les annonces d'un commerçant
    List<AnnonceCommercant> findByCommercantOrderByDateCreationDesc(Commercant commercant);
    
    // Trouver les annonces actives
    List<AnnonceCommercant> findByStatutOrderByDateCreationDesc(AnnonceCommercant.StatutAnnonce statut);
    
    // Trouver les annonces réservées aux affiliés
    List<AnnonceCommercant> findByReserveAuxAffiliesAndStatutOrderByDateCreationDesc(Boolean reserveAuxAffilies, AnnonceCommercant.StatutAnnonce statut);
    
    // Trouver les annonces accessibles selon le statut d'affiliation du livreur
    @Query("SELECT a FROM AnnonceCommercant a WHERE a.statut = :statut AND " +
           "(a.reserveAuxAffilies = false OR :estAffilie = true) " +
           "ORDER BY a.dateCreation DESC")
    List<AnnonceCommercant> findAnnoncesAccessibles(@Param("statut") AnnonceCommercant.StatutAnnonce statut, 
                                                   @Param("estAffilie") Boolean estAffilie);
    
    // Trouver les annonces par ville de départ
    List<AnnonceCommercant> findByVilleDepartContainingIgnoreCaseAndStatutOrderByDateCreationDesc(String villeDepart, AnnonceCommercant.StatutAnnonce statut);
    
    // Trouver les annonces par ville d'arrivée
    List<AnnonceCommercant> findByVilleArriveeContainingIgnoreCaseAndStatutOrderByDateCreationDesc(String villeArrivee, AnnonceCommercant.StatutAnnonce statut);
    
    // Compter les annonces actives d'un commerçant
    Long countByCommercantAndStatut(Commercant commercant, AnnonceCommercant.StatutAnnonce statut);
}
