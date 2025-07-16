package com.ecodeli.backend.controller;

import com.ecodeli.model.Document;
import com.ecodeli.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174"})
public class DocumentController {
    
    @Autowired
    private DocumentService documentService;
    
    /**
     * Nettoie le nom de fichier pour les en-têtes HTTP en supprimant les caractères spéciaux
     */
    private String cleanFilename(String filename) {
        if (filename == null) return "file";
        
        // Normaliser et supprimer les accents
        String normalized = Normalizer.normalize(filename, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        
        // Remplacer les caractères spéciaux par des underscores
        String cleaned = withoutAccents.replaceAll("[^a-zA-Z0-9._-]", "_");
        
        // Éviter les noms vides ou ne contenant que des caractères spéciaux
        if (cleaned.trim().isEmpty() || cleaned.equals("_")) {
            cleaned = "file";
        }
        
        return cleaned;
    }
    
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(documents);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Document>> getDocumentsByUser(@PathVariable Long userId) {
        List<Document> documents = documentService.getDocumentsByUtilisateur(userId);
        return ResponseEntity.ok(documents);
    }
    
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<Document> getDocumentByUserAndType(
            @PathVariable Long userId, 
            @PathVariable String type) {
        
        try {
            Document.TypeDocument typeDoc = Document.TypeDocument.valueOf(type.toUpperCase());
            Optional<Document> document = documentService.getDocumentByUtilisateurAndType(userId, typeDoc);
            
            return document.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
                          
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam("type") String type) {
        
        try {
            // Validation du fichier
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le fichier est vide"));
            }
            
            // Validation du type de fichier
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("application/pdf") && 
                !contentType.startsWith("image/"))) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Type de fichier non autorisé. Utilisez PDF ou image"));
            }
            
            // Validation de la taille (5MB max)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le fichier est trop volumineux (max 5MB)"));
            }
            
            Document.TypeDocument typeDoc = Document.TypeDocument.valueOf(type.toUpperCase());
            Document document = documentService.uploadDocument(file, userId, typeDoc);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(document);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Type de document invalide"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de l'upload: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{documentId}/valider")
    public ResponseEntity<?> validerDocument(
            @PathVariable Long documentId,
            @RequestBody(required = false) Map<String, String> body) {
        
        try {
            String commentaire = body != null ? body.get("commentaire") : "";
            documentService.validerDocument(documentId, commentaire);
            return ResponseEntity.ok(Map.of("message", "Document validé avec succès"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de la validation: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{documentId}/refuser")
    public ResponseEntity<?> refuserDocument(
            @PathVariable Long documentId,
            @RequestBody Map<String, String> body) {
        
        try {
            String commentaire = body.get("commentaire");
            if (commentaire == null || commentaire.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Un commentaire est requis pour refuser un document"));
            }
            
            documentService.refuserDocument(documentId, commentaire);
            return ResponseEntity.ok(Map.of("message", "Document refusé"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors du refus: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{documentId}/file")
    public ResponseEntity<Resource> getDocumentFile(@PathVariable Long documentId) {
        try {
            Optional<Document> documentOpt = documentService.getDocumentById(documentId);
            if (documentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Document document = documentOpt.get();
            Path filePath = Paths.get(document.getCheminFichier());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (document.getNom().toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else if (document.getNom().toLowerCase().matches(".*\\.(jpg|jpeg|png|gif)$")) {
                    contentType = "image/" + document.getNom().substring(document.getNom().lastIndexOf(".") + 1);
                }
                
                // Nettoyer le nom de fichier pour éviter les erreurs d'encodage
                String cleanedFilename = cleanFilename(document.getNom());
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + cleanedFilename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
