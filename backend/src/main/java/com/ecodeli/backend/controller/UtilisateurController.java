package com.ecodeli.backend.controller;

import com.ecodeli.model.Utilisateur;
import com.ecodeli.backend.service.UtilisateurService;
import com.ecodeli.backend.service.DocumentService;
import com.ecodeli.backend.security.JwtService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

import com.ecodeli.model.Livreur;
import com.ecodeli.model.Prestataire;
import com.ecodeli.model.Commercant;
import com.ecodeli.model.dto.InscriptionDTO;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174"})
public class UtilisateurController {

    private final UtilisateurService utilisateurService;
    private final DocumentService documentService;
    private final JwtService jwtService;

    public UtilisateurController(UtilisateurService utilisateurService, DocumentService documentService, JwtService jwtService) {
        this.utilisateurService = utilisateurService;
        this.documentService = documentService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurService.getAllUtilisateurs();
    }

    @GetMapping("/{id}")
    public Utilisateur getUtilisateurById(@PathVariable Long id) {
        return utilisateurService.getUtilisateurById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @GetMapping("/role/{role}")
    public List<Utilisateur> getUtilisateursByRole(@PathVariable String role) {
        return utilisateurService.getUtilisateursByRole(role);
    }

    @GetMapping("/count")
    public long countUtilisateurs() {
        return utilisateurService.countUtilisateurs();
    }

    @GetMapping("/profile")
    public ResponseEntity<Utilisateur> getCurrentUserProfile(HttpServletRequest request) {
        try {
            // Extraire le token JWT depuis l'en-tête Authorization
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String token = authHeader.substring(7); // Enlever "Bearer "
            
            // Valider le token
            if (!jwtService.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Extraire l'email de l'utilisateur depuis le token
            String email = jwtService.getEmailFromToken(token);
            
            // Récupérer l'utilisateur depuis la base de données
            return utilisateurService.findByEmail(email)
                    .map(utilisateur -> {
                        // Vérifier et mettre à jour le statut selon les documents validés
                        Utilisateur utilisateurMisAJour = documentService.checkAndUpdateUserStatus(utilisateur.getId());
                        return ResponseEntity.ok(utilisateurMisAJour);
                    })
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable Long id) {
        try {
            utilisateurService.deleteUtilisateur(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUtilisateur(@PathVariable Long id, @RequestBody InscriptionDTO dto) {
        return utilisateurService.getUtilisateurById(id)
            .map(utilisateur -> {
                utilisateur.setNom(dto.nom);
                utilisateur.setPrenom(dto.prenom);
                utilisateur.setEmail(dto.email);
                utilisateur.setTelephone(dto.telephone);
                utilisateur.setRole(Utilisateur.Role.valueOf(dto.role.toUpperCase()));

                switch (dto.role.toUpperCase()) {
                    case "LIVREUR" -> {
                        if (utilisateur instanceof Livreur liv) {
                            liv.setVehicule(dto.vehicule);
                            liv.setPermisVerif(dto.permisVerif);
                        }
                    }
                    case "COMMERCANT" -> {
                        if (utilisateur instanceof Commercant com) {
                            com.setSIRET(dto.siret);
                        }
                    }
                    case "PRESTATAIRE" -> {
                        if (utilisateur instanceof Prestataire pres) {
                            pres.setTypeService(dto.typeService);
                            if (dto.tarifHoraire != null) pres.setTarifHoraire(dto.tarifHoraire.floatValue());
                        }
                    }
                    // CLIENT n'a pas de champs spécifiques à modifier ici
                }

                return ResponseEntity.ok(utilisateurService.saveUtilisateur(utilisateur));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
