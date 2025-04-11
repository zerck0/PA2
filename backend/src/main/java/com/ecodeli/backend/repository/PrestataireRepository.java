package com.ecodeli.backend.repository;

import com.ecodeli.model.Prestataire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrestataireRepository extends JpaRepository <Prestataire, Long>{
}
