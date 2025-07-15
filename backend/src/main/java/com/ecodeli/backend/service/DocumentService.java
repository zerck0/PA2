package com.ecodeli.backend.service;

import com.ecodeli.model.Document;
import com.ecodeli.model.Utilisateur;
import com.ecodeli.backend.repository.DocumentRepository;
import com.ecodeli.backend.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    private final String uploadDir = "uploads/documents/";
    
    public List<Document> getDocumentsByUtilisateur(Long utilisateurId) {
        return documentRepository.findByUtilisateurId(utilisateurId);
    }
    
    public Optional<Document> getDocumentByUtilisateurAndType(Long utilisateurId, Document.TypeDocument type) {
        return documentRepository.findByUtilisateurIdAndType(utilisateurId, type);
    }
    
    public Optional<Document> getDocumentById(Long documentId) {
        return documentRepository.findById(documentId);
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
        
        // Supprimer l'ancien document s'il existe (sauf pour les photos d'annonces)
        if (type != Document.TypeDocument.PHOTO_ANNONCE) {
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
        }
        
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
    
    /**
     * Vérifie et met à jour le statut d'un utilisateur selon ses documents validés
     */
    public Utilisateur checkAndUpdateUserStatus(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Récupérer les documents obligatoires selon le rôle
        List<Document.TypeDocument> documentsObligatoires = getDocumentsObligatoires(utilisateur.getRole());
        
        // Si aucun document obligatoire (CLIENT), valider automatiquement
        if (documentsObligatoires.isEmpty()) {
            if (utilisateur.getStatut() == Utilisateur.StatutCompte.NON_VERIFIE) {
                utilisateur.setStatut(Utilisateur.StatutCompte.VALIDE);
                utilisateurRepository.save(utilisateur);
            }
            return utilisateur;
        }

        // Vérifier l'état des documents
        List<Document> documentsUtilisateur = documentRepository.findByUtilisateurId(utilisateurId);
        
        Set<Document.TypeDocument> typesDocumentsValides = documentsUtilisateur.stream()
            .filter(doc -> doc.getStatut() == Document.StatutDocument.VALIDE)
            .map(Document::getType)
            .collect(Collectors.toSet());

        Set<Document.TypeDocument> typesDocumentsRefuses = documentsUtilisateur.stream()
            .filter(doc -> doc.getStatut() == Document.StatutDocument.REFUSE)
            .map(Document::getType)
            .collect(Collectors.toSet());

        boolean tousDocumentsValides = typesDocumentsValides.containsAll(documentsObligatoires);
        boolean documentObligatoireRefuse = documentsObligatoires.stream()
            .anyMatch(typesDocumentsRefuses::contains);

        // Déterminer le nouveau statut
        Utilisateur.StatutCompte nouveauStatut = determinerNouveauStatut(
            utilisateur.getStatut(), 
            tousDocumentsValides, 
            documentObligatoireRefuse,
            documentsUtilisateur.size() > 0
        );

        // Mettre à jour si nécessaire
        if (nouveauStatut != utilisateur.getStatut()) {
            utilisateur.setStatut(nouveauStatut);
            utilisateurRepository.save(utilisateur);
        }
        
        return utilisateur;
    }
    
    /**
     * Détermine le nouveau statut basé sur l'état actuel et les documents
     */
    private Utilisateur.StatutCompte determinerNouveauStatut(
            Utilisateur.StatutCompte statutActuel,
            boolean tousDocumentsValides,
            boolean documentObligatoireRefuse,
            boolean auMoinsUnDocument) {

        // Si tous les documents obligatoires sont validés
        if (tousDocumentsValides) {
            return Utilisateur.StatutCompte.VALIDE;
        }

        // Si un document obligatoire est refusé, retour à NON_VERIFIE
        if (documentObligatoireRefuse) {
            return Utilisateur.StatutCompte.NON_VERIFIE;
        }

        // Si au moins un document est uploadé mais validation pas complète
        if (auMoinsUnDocument && statutActuel == Utilisateur.StatutCompte.NON_VERIFIE) {
            return Utilisateur.StatutCompte.EN_ATTENTE;
        }

        // Garder le statut actuel dans les autres cas
        return statutActuel;
    }
    
    /**
     * Retourne la liste des types de documents obligatoires selon le rôle
     */
    private List<Document.TypeDocument> getDocumentsObligatoires(Utilisateur.Role role) {
        switch (role) {
            case LIVREUR:
                return Arrays.asList(
                    Document.TypeDocument.PERMIS_CONDUIRE,
                    Document.TypeDocument.CARTE_IDENTITE,
                    Document.TypeDocument.ASSURANCE_VEHICULE
                );
                
            case PRESTATAIRE:
                return Arrays.asList(
                    Document.TypeDocument.CARTE_IDENTITE,
                    Document.TypeDocument.JUSTIFICATIF_DOMICILE,
                    Document.TypeDocument.STATUT_AUTOENTREPRENEUR,
                    Document.TypeDocument.CASIER_JUDICIAIRE
                    // ASSURANCE_PROFESSIONNELLE retiré des obligatoires
                );
                
            case COMMERCANT:
                return Arrays.asList(
                    Document.TypeDocument.CARTE_IDENTITE,
                    Document.TypeDocument.KBIS
                    // ASSURANCE_PROFESSIONNELLE retiré des obligatoires
                );
                
            case CLIENT:
            default:
                return Arrays.asList(); // Aucun document obligatoire pour les clients
        }
    }
}
