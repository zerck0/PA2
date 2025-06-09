package com.ecodeli.backend.controller;

import com.ecodeli.backend.service.VerificationService;
import com.ecodeli.model.CodeVerification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class VerificationController {

    @Autowired
    private VerificationService verificationService;

    /**
     * Envoie un code de vérification par email
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            if (userId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "ID utilisateur requis"));
            }

            verificationService.generateAndSendCode(userId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Code de vérification envoyé",
                "success", true
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de l'envoi du code"));
        }
    }

    /**
     * Vérifie un code de vérification
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String code = request.get("code").toString();

            if (userId == null || code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "ID utilisateur et code requis"));
            }

            boolean isValid = verificationService.verifyCode(userId, code.trim());
            
            if (isValid) {
                return ResponseEntity.ok(Map.of(
                    "message", "Compte vérifié avec succès",
                    "verified", true
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "message", "Code invalide ou expiré",
                        "verified", false
                    ));
            }
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Format d'ID utilisateur invalide"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de la vérification"));
        }
    }

    /**
     * Vérifie le statut de vérification d'un utilisateur
     */
    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getVerificationStatus(@PathVariable Long userId) {
        try {
            boolean hasValidCode = verificationService.hasValidCode(userId);
            Optional<CodeVerification> lastCode = verificationService.getLastCodeInfo(userId);
            
            Map<String, Object> response = Map.of(
                "hasValidCode", hasValidCode,
                "lastCodeSent", lastCode.map(code -> code.getCreatedAt()).orElse(null),
                "expiresAt", lastCode.map(code -> code.getExpiresAt()).orElse(null)
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de la récupération du statut"));
        }
    }

    /**
     * Renvoie un nouveau code (limité dans le temps)
     */
    @PostMapping("/resend")
    public ResponseEntity<?> resendCode(@RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            if (userId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "ID utilisateur requis"));
            }

            // Vérifier s'il y a déjà un code valide récent
            Optional<CodeVerification> lastCode = verificationService.getLastCodeInfo(userId);
            if (lastCode.isPresent()) {
                CodeVerification code = lastCode.get();
                // Limiter le renvoi à 1 fois par minute
                if (code.getCreatedAt().plusMinutes(1).isAfter(java.time.LocalDateTime.now())) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "Veuillez attendre avant de demander un nouveau code"));
                }
            }

            verificationService.generateAndSendCode(userId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Nouveau code envoyé",
                "success", true
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors du renvoi du code"));
        }
    }
}
