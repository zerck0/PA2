package com.ecodeli.backend.controller;

import com.ecodeli.model.*;
import com.ecodeli.model.dto.InscriptionDTO;
import com.ecodeli.backend.repository.*;
import com.ecodeli.backend.security.JwtService;
import com.ecodeli.backend.service.UtilisateurService;
import com.ecodeli.backend.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/inscription")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
@Validated
public class InscriptionController {

    private final LivreurRepository livreurRepo;
    private final ClientRepository clientRepo;
    private final CommercantRepository commercantRepo;
    private final PrestataireRepository prestataireRepo;

    @Autowired
    private UtilisateurService utilisateurService; // ← Ajoutez cette ligne

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VerificationService verificationService;

    public InscriptionController(
            LivreurRepository livreurRepo,
            ClientRepository clientRepo,
            CommercantRepository commercantRepo,
            PrestataireRepository prestataireRepo
    ) {
        this.livreurRepo = livreurRepo;
        this.clientRepo = clientRepo;
        this.commercantRepo = commercantRepo;
        this.prestataireRepo = prestataireRepo;
    }

    @PostMapping
    public ResponseEntity<?> inscrire(@Valid @RequestBody InscriptionDTO dto) {
        try {
            // 1. Vérifier si l'email existe déjà
            if (utilisateurService.existsByEmail(dto.email)) {
                return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cette adresse email est déjà utilisée"));
            }
            
            // 2. Validation de la politique de mot de passe
            String passwordError = validatePasswordStrength(dto.motDePasse);
            if (passwordError != null) {
                return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", passwordError));
            }
            
            // 3. Validation des champs selon le rôle
            String validationError = validateRoleSpecificFields(dto);
            if (validationError != null) {
                return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", validationError));
            }
            
            // Champs communs à tous les utilisateurs
            LocalDate dateCreation = LocalDate.now();
            Utilisateur utilisateur;
            
            switch (dto.role.toUpperCase()) {
                case "LIVREUR" -> {
                    Livreur livreur = new Livreur();
                    setCommonFields(livreur, dto, dateCreation);
                    livreur.setRole(Utilisateur.Role.LIVREUR);
                    livreur.setVehicule(dto.vehicule);
                    livreur.setPermisVerif(dto.permisVerif);
                    livreur.setNote(0.0);
                    livreur.setDossierValide(false);
                    utilisateur = livreurRepo.save(livreur);
                }
                case "CLIENT" -> {
                    Client client = new Client();
                    setCommonFields(client, dto, dateCreation);
                    client.setRole(Utilisateur.Role.CLIENT);
                    client.setTutorielVu(false); // Par défaut
                    utilisateur = clientRepo.save(client);
                }
                case "COMMERCANT" -> {
                    Commercant commercant = new Commercant();
                    setCommonFields(commercant, dto, dateCreation);
                    commercant.setRole(Utilisateur.Role.COMMERCANT);
                    commercant.setSIRET(dto.siret);
                    commercant.setVerifDossier(false); // Par défaut
                    // Optionnel : à compléter plus tard
                    commercant.setNomEntreprise("");
                    commercant.setAdresseCommerce("");
                    utilisateur = commercantRepo.save(commercant);
                }
                case "PRESTATAIRE" -> {
                    Prestataire prestataire = new Prestataire();
                    setCommonFields(prestataire, dto, dateCreation);
                    prestataire.setRole(Utilisateur.Role.PRESTATAIRE);
                    prestataire.setTypeService(dto.typeService);
                    prestataire.setVerifDossier(false); // Par défaut
                    prestataire.setTarifHoraire(dto.tarifHoraire != null ? dto.tarifHoraire.floatValue() : 0f);
                    prestataire.setNote(0f); // Note initiale
                    utilisateur = prestataireRepo.save(prestataire);
                }
                default -> {
                    return ResponseEntity.badRequest().body("Rôle invalide: " + dto.role);
                }
            }
            
            // Envoyer le code de vérification par email
            verificationService.generateAndSendCode(utilisateur.getId());
            
            // Préparation de la réponse (sans token ni connexion automatique)
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Inscription réussie ! Un code de vérification a été envoyé à votre adresse email.");
            response.put("userId", utilisateur.getId());
            response.put("email", utilisateur.getEmail());
            response.put("requiresVerification", true);
            
            return ResponseEntity.ok(response);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Cette adresse email est déjà utilisée"));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de la création: " + e.getMessage()));
        }
    }

    private void setCommonFields(Utilisateur utilisateur, InscriptionDTO dto, LocalDate dateCreation) {
        utilisateur.setNom(dto.nom);
        utilisateur.setPrenom(dto.prenom);
        utilisateur.setEmail(dto.email);
        utilisateur.setPassword(passwordEncoder.encode(dto.motDePasse)); // Hashage du mot de passe
        utilisateur.setTelephone(dto.telephone);
        utilisateur.setDateCreation(dateCreation);
        // Nouveaux champs d'adresse
        utilisateur.setAdresse(dto.adresse != null ? dto.adresse : "");
        utilisateur.setVille(dto.ville != null ? dto.ville : "");
        utilisateur.setCodepostal(dto.codePostal != null ? dto.codePostal : "");
    }

    private String validateRoleSpecificFields(InscriptionDTO dto) {
        switch (dto.role.toUpperCase()) {
            case "LIVREUR":
                if (dto.vehicule == null || dto.vehicule.trim().isEmpty()) {
                    return "Le type de véhicule est obligatoire pour un livreur";
                }
                if (!dto.permisVerif) {
                    return "La certification du permis est obligatoire pour un livreur";
                }
                break;
                
            case "COMMERCANT":
                if (dto.siret == null || dto.siret.trim().isEmpty()) {
                    return "Le numéro SIRET est obligatoire pour un commerçant";
                }
                if (!isValidSIRET(dto.siret)) {
                    return "Le numéro SIRET n'est pas valide (14 chiffres requis)";
                }
                break;
                
            case "PRESTATAIRE":
                if (dto.typeService == null || dto.typeService.trim().isEmpty()) {
                    return "Le type de service est obligatoire pour un prestataire";
                }
                if (dto.tarifHoraire == null || dto.tarifHoraire <= 0) {
                    return "Le tarif horaire doit être supérieur à 0";
                }
                break;
        }
        return null;
    }

    private boolean isValidSIRET(String siret) {
        return siret.matches("\\d{14}");
    }

    /**
     * Validation de la politique de mot de passe robuste
     * Requis : 8 caractères minimum + 1 majuscule + 1 chiffre + 1 caractère spécial
     */
    private String validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            return "Le mot de passe doit contenir au moins 8 caractères";
        }
        
        if (!password.matches(".*[A-Z].*")) {
            return "Le mot de passe doit contenir au moins une lettre majuscule";
        }
        
        if (!password.matches(".*\\d.*")) {
            return "Le mot de passe doit contenir au moins un chiffre";
        }
        
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*(),.?\":{}|<>)";
        }
        
        return null; // Mot de passe valide
    }
}
