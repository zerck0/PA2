package com.ecodeli.backend.service;

import com.ecodeli.model.Document;
import com.ecodeli.backend.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    private final String uploadDir = "uploads/documents/";
    
    public List<Document> getDocumentsByUtilisateur(Long utilisateurId) {
        return documentRepository.findByUtilisateurId(utilisateurId);
    }
    
    public Optional<Document> getDocumentByUtilisateurAndType(Long utilisateurId, Document.TypeDocument type) {
        return documentRepository.findByUtilisateurIdAndType(utilisateurId, type);
    }
    
    public Document uploadDocument(MultipartFile file, Long utilisateurId, Document.TypeDocument type) throws IOException {
        // Créer le dossier s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Générer un nom unique pour le fichier
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName != null && originalFileName.contains(".") 
            ? originalFileName.substring(originalFileName.lastIndexOf("."))
            : "";
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        
        // Sauvegarder le fichier
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Supprimer l'ancien document s'il existe
        Optional<Document> existingDoc = getDocumentByUtilisateurAndType(utilisateurId, type);
        existingDoc.ifPresent(doc -> {
            try {
                Files.deleteIfExists(Paths.get(doc.getCheminFichier()));
                documentRepository.delete(doc);
            } catch (IOException e) {
                // Log l'erreur mais continue
                System.err.println("Erreur lors de la suppression de l'ancien fichier: " + e.getMessage());
            }
        });
        
        // Créer l'entité Document
        Document document = new Document();
        document.setNom(originalFileName);
        document.setCheminFichier(filePath.toString());
        document.setType(type);
        document.setUtilisateurId(utilisateurId);
        document.setStatut(Document.StatutDocument.EN_ATTENTE);
        
        return documentRepository.save(document);
    }
    
    public void validerDocument(Long documentId, String commentaire) {
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isPresent()) {
            Document document = docOpt.get();
            document.setStatut(Document.StatutDocument.VALIDE);
            document.setCommentaireValidation(commentaire);
            documentRepository.save(document);
        }
    }
    
    public void refuserDocument(Long documentId, String commentaire) {
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isPresent()) {
            Document document = docOpt.get();
            document.setStatut(Document.StatutDocument.REFUSE);
            document.setCommentaireValidation(commentaire);
            documentRepository.save(document);
        }
    }
}
