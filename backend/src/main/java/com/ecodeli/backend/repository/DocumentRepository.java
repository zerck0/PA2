package com.ecodeli.backend.repository;

import com.ecodeli.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    List<Document> findByUtilisateurId(Long utilisateurId);
    
    Optional<Document> findByUtilisateurIdAndType(Long utilisateurId, Document.TypeDocument type);
    
    List<Document> findByStatut(Document.StatutDocument statut);
}
