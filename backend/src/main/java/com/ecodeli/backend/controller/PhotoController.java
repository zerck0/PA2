package com.ecodeli.backend.controller;

import com.ecodeli.model.Document;
import com.ecodeli.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class PhotoController {
    
    @Autowired
    private DocumentService documentService;
    
    @PostMapping("/annonce/upload")
    public ResponseEntity<?> uploadPhotoAnnonce(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        
        try {
            // Validation du fichier
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le fichier est vide"));
            }
            
            // Validation du type de fichier (seulement images)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Seules les images sont autorisées (JPEG, PNG, GIF, etc.)"));
            }
            
            // Validation de la taille (2MB max pour les photos)
            if (file.getSize() > 2 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "La photo est trop volumineuse (max 2MB)"));
            }
            
            // Upload comme document de type PHOTO_ANNONCE
            Document photo = documentService.uploadDocument(file, userId, Document.TypeDocument.PHOTO_ANNONCE);
            
            // Retourner l'URL de la photo pour utilisation immédiate
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", photo.getId(),
                "url", "/api/documents/" + photo.getId() + "/file",
                "nom", photo.getNom()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de l'upload: " + e.getMessage()));
        }
    }
}
