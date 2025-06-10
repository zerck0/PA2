package com.ecodeli.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:ecodeli@example.com}")
    private String fromEmail;

    @Value("${ecodeli.email.enabled:false}")
    private boolean emailEnabled;

    /**
     * Envoie un code de vérification par email
     */
    public void sendVerificationCode(String toEmail, String userName, String code) {
        if (!emailEnabled || mailSender == null) {
            // Mode simulation pour développement
            logger.info("=== SIMULATION EMAIL ===");
            logger.info("To: {}", toEmail);
            logger.info("Subject: Code de vérification EcoDeli");
            logger.info("Code: {}", code);
            logger.info("========================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Code de vérification EcoDeli");
            message.setText(buildVerificationMessage(userName, code));

            mailSender.send(message);
            logger.info("Email de vérification envoyé à: {}", toEmail);
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email à {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Impossible d'envoyer l'email de vérification");
        }
    }

    /**
     * Construit le message de vérification
     */
    private String buildVerificationMessage(String userName, String code) {
        return String.format("""
            Bonjour %s,
            
            Bienvenue sur EcoDeli !
            
            Votre code de vérification est : %s
            
            Ce code expire dans 15 minutes.
            
            Si vous n'avez pas créé de compte EcoDeli, ignorez ce message.
            
            Cordialement,
            L'équipe EcoDeli
            """, userName, code);
    }

    /**
     * Envoie un email de bienvenue après validation
     */
    public void sendWelcomeEmail(String toEmail, String userName) {
        if (!emailEnabled || mailSender == null) {
            logger.info("=== SIMULATION WELCOME EMAIL ===");
            logger.info("To: {}", toEmail);
            logger.info("Welcome message sent to: {}", userName);
            logger.info("================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Bienvenue sur EcoDeli !");
            message.setText(buildWelcomeMessage(userName));

            mailSender.send(message);
            logger.info("Email de bienvenue envoyé à: {}", toEmail);
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de bienvenue à {}: {}", toEmail, e.getMessage());
            // Ne pas faire échouer le processus pour l'email de bienvenue
        }
    }

    /**
     * Construit le message de bienvenue
     */
    private String buildWelcomeMessage(String userName) {
        return String.format("""
            Bonjour %s,
            
            Votre compte EcoDeli a été activé avec succès !
            
            Vous pouvez maintenant profiter de tous nos services de livraison écologique.
            
            Connectez-vous à votre compte pour commencer : http://localhost:5173
            
            Merci de faire confiance à EcoDeli !
            
            L'équipe EcoDeli
            """, userName);
    }

    /**
     * Vérifie si le service email est configuré
     */
    public boolean isEmailConfigured() {
        return emailEnabled && mailSender != null;
    }
}
