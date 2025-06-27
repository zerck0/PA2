package com.ecodeli.backend.controller;

import com.ecodeli.model.Utilisateur;
import com.ecodeli.backend.service.UtilisateurService;
import com.ecodeli.model.dto.LoginDTO;
import com.ecodeli.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final UtilisateurService utilisateurService;
    private final JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthController(UtilisateurService utilisateurService, JwtService jwtService) {
        this.utilisateurService = utilisateurService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {

        
        Optional<Utilisateur> utilisateurOpt = utilisateurService.findByEmail(loginDTO.email);
        
        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Email ou mot de passe incorrect"));
        }
        
        Utilisateur utilisateur = utilisateurOpt.get();
        
        // Vérification du mot de passe avec BCrypt
        boolean passwordMatches = passwordEncoder.matches(loginDTO.password, utilisateur.getPassword());
        
        if (!passwordMatches) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Email ou mot de passe incorrect"));
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
        userInfo.put("statut", utilisateur.getStatut() != null ? utilisateur.getStatut().toString() : "NON_VERIFIE");
        
        response.put("user", userInfo);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        // Vérifier si l'en-tête d'autorisation est présent et formaté correctement
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        }
        
        // Extraire le token JWT
        String token = authHeader.substring(7);
        
        try {
            // Vérifier le token
            boolean isValid = jwtService.validateToken(token);
            if (isValid) {
                String email = jwtService.getEmailFromToken(token);
                Optional<Utilisateur> utilisateur = utilisateurService.findByEmail(email);
                
                if (utilisateur.isPresent()) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("valid", true);
                    response.put("user", Map.of(
                        "id", utilisateur.get().getId(),
                        "nom", utilisateur.get().getNom(),
                        "prenom", utilisateur.get().getPrenom(),
                        "email", utilisateur.get().getEmail(),
                        "role", utilisateur.get().getRole().toString(),
                        "statut", utilisateur.get().getStatut() != null ? utilisateur.get().getStatut().toString() : "NON_VERIFIE"
                    ));
                    return ResponseEntity.ok(response);
                }
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "valid", false, 
                "message", "Token invalid: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        boolean isAvailable = !utilisateurService.existsByEmail(email);
        return ResponseEntity.ok(Map.of("available", isAvailable));
    }
}
