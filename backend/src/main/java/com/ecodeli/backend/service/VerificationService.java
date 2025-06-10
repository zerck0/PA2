package com.ecodeli.backend.service;

import com.ecodeli.backend.repository.CodeVerificationRepository;
import com.ecodeli.backend.repository.UtilisateurRepository;
import com.ecodeli.model.CodeVerification;
import com.ecodeli.model.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class VerificationService {

    private static final Logger logger = LoggerFactory.getLogger(VerificationService.class);
    private static final int CODE_VALIDITY_MINUTES = 15;
    private static final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    private CodeVerificationRepository codeRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Génère et envoie un nouveau code de vérification
     */
    @Transactional
    public void generateAndSendCode(Long userId) {
        // Récupérer l'utilisateur
        Optional<Utilisateur> userOpt = utilisateurRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        
        Utilisateur user = userOpt.get();

        // Vérifier si l'utilisateur est déjà vérifié
        if (user.getStatut() == Utilisateur.StatutCompte.VALIDE) {
            throw new RuntimeException("Ce compte est déjà vérifié");
        }

        // Invalider tous les codes précédents
        codeRepository.invalidateAllCodesForUser(userId);

        // Générer un nouveau code
        String code = generateCode();
        
        // Créer et sauvegarder le code
        CodeVerification verification = new CodeVerification(userId, code, CODE_VALIDITY_MINUTES);
        codeRepository.save(verification);

        // Envoyer l'email
        String userName = user.getPrenom() + " " + user.getNom();
        emailService.sendVerificationCode(user.getEmail(), userName, code);

        logger.info("Code de vérification généré et envoyé pour l'utilisateur ID: {}", userId);
    }

    /**
     * Vérifie un code de vérification et active le compte
     */
    @Transactional
    public boolean verifyCode(Long userId, String code) {
        // Vérifier si le code est valide
        Optional<CodeVerification> verificationOpt = codeRepository.findValidCode(
            userId, code, LocalDateTime.now()
        );

        if (verificationOpt.isEmpty()) {
            logger.warn("Code invalide ou expiré pour l'utilisateur ID: {}", userId);
            return false;
        }

        CodeVerification verification = verificationOpt.get();
        
        // Marquer le code comme utilisé
        verification.markAsUsed();
        codeRepository.save(verification);

        // Activer le compte utilisateur
        Optional<Utilisateur> userOpt = utilisateurRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé");
        }

        Utilisateur user = userOpt.get();
        
        // Définir le statut selon le rôle
        switch (user.getRole()) {
            case CLIENT -> user.setStatut(Utilisateur.StatutCompte.VALIDE);
            case LIVREUR, PRESTATAIRE, COMMERCANT -> user.setStatut(Utilisateur.StatutCompte.EN_ATTENTE);
        }
        
        utilisateurRepository.save(user);

        // Envoyer email de bienvenue
        String userName = user.getPrenom() + " " + user.getNom();
        emailService.sendWelcomeEmail(user.getEmail(), userName);

        logger.info("Compte vérifié avec succès pour l'utilisateur ID: {}, nouveau statut: {}", 
                   userId, user.getStatut());
        
        return true;
    }

    /**
     * Vérifie si un utilisateur a un code valide
     */
    public boolean hasValidCode(Long userId) {
        return codeRepository.hasValidCode(userId, LocalDateTime.now());
    }

    /**
     * Génère un code à 6 chiffres
     */
    private String generateCode() {
        int code = secureRandom.nextInt(900000) + 100000; // Entre 100000 et 999999
        return String.valueOf(code);
    }

    /**
     * Nettoie les codes expirés (à appeler périodiquement)
     */
    @Transactional
    public void cleanExpiredCodes() {
        codeRepository.deleteExpiredCodes(LocalDateTime.now());
        logger.info("Codes expirés supprimés");
    }

    /**
     * Récupère les informations du dernier code pour un utilisateur
     */
    public Optional<CodeVerification> getLastCodeInfo(Long userId) {
        return codeRepository.findTopByUserIdAndIsUsedFalseOrderByCreatedAtDesc(userId);
    }
}
