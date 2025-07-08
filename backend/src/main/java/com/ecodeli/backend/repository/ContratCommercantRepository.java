package com.ecodeli.backend.repository;

import com.ecodeli.model.ContratCommercant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ContratCommercantRepository extends JpaRepository<ContratCommercant, Long> {
    
    Optional<ContratCommercant> findByCommercantId(Long commercantId);
    
    Optional<ContratCommercant> findByNumeroContrat(String numeroContrat);
    
    boolean existsByCommercantId(Long commercantId);
}
