package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "code_verification")
public class CodeVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean isUsed = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private TypeVerification type = TypeVerification.EMAIL_VERIFICATION;

    public enum TypeVerification {
        EMAIL_VERIFICATION, PASSWORD_RESET
    }

    // Constructeur pour créer un nouveau code
    public CodeVerification(Long userId, String code, int minutesValid) {
        this.userId = userId;
        this.code = code;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = this.createdAt.plusMinutes(minutesValid);
        this.isUsed = false;
        this.type = TypeVerification.EMAIL_VERIFICATION;
    }

    // Méthode pour vérifier si le code est encore valide
    public boolean isValid() {
        return !isUsed && LocalDateTime.now().isBefore(expiresAt);
    }

    // Méthode pour marquer le code comme utilisé
    public void markAsUsed() {
        this.isUsed = true;
    }
}
