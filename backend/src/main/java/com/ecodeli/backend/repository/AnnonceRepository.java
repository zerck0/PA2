package com.ecodeli.backend.repository;

import com.ecodeli.model.Annonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {
    List<Annonce> findByCreateurId(Long utilisateurId);
    List<Annonce> findByStatut(Annonce.AnnonceStatus statut);
    List<Annonce> findByVilleDepartAndVilleArrivee(String villeDepart, String villeArrivee);
}