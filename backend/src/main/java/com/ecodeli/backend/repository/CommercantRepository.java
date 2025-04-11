package com.ecodeli.backend.repository;

import com.ecodeli.model.Commercant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommercantRepository extends JpaRepository<Commercant, Long> {
}
