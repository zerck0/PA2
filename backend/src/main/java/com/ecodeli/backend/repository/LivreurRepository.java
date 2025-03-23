package com.ecodeli.backend.repository;

import com.ecodeli.backend.model.Livreur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivreurRepository extends JpaRepository<Livreur, Long> {
    // Ici, on pourra ajouter des méthodes spécifiques plus tard
}
