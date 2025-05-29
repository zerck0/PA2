package com.ecodeli.backend.controller;

import com.ecodeli.model.*;
import com.ecodeli.model.dto.InscriptionDTO;
import com.ecodeli.backend.repository.*;
import com.ecodeli.backend.security.JwtService;
import com.ecodeli.backend.service.UtilisateurService;
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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
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
            
            // 2. Validation des champs selon le rôle
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
            
            // Génération du token JWT
            String token = jwtService.generateToken(utilisateur);
            
            // Préparation de la réponse
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            
            // Informations de l'utilisateur (sans le mot de passe)
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", utilisateur.getId());
            userInfo.put("nom", utilisateur.getNom());
            userInfo.put("prenom", utilisateur.getPrenom());
            userInfo.put("email", utilisateur.getEmail());
            userInfo.put("role", utilisateur.getRole().toString());
            
            response.put("user", userInfo);
            
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
        utilisateur.setPassword(passwordEncoder.encode(dto.password)); // Hashage du mot de passe
        utilisateur.setTelephone(dto.telephone);
        utilisateur.setDateCreation(dateCreation);
        // Champs optionnels à remplir plus tard
        utilisateur.setAdresse("");
        utilisateur.setVille("");
        utilisateur.setCodepostal("");
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
}
