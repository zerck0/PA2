package com.ecodeli.backend.repository;

import com.ecodeli.model.CodeVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CodeVerificationRepository extends JpaRepository<CodeVerification, Long> {

    // Trouver un code valide pour un utilisateur
    @Query("SELECT cv FROM CodeVerification cv WHERE cv.userId = :userId AND cv.code = :code AND cv.isUsed = false AND cv.expiresAt > :now")
    Optional<CodeVerification> findValidCode(@Param("userId") Long userId, @Param("code") String code, @Param("now") LocalDateTime now);

    // Trouver le dernier code créé pour un utilisateur (pour vérification)
    Optional<CodeVerification> findTopByUserIdAndIsUsedFalseOrderByCreatedAtDesc(Long userId);

    // Invalider tous les codes précédents d'un utilisateur
    @Modifying
    @Transactional
    @Query("UPDATE CodeVerification cv SET cv.isUsed = true WHERE cv.userId = :userId AND cv.isUsed = false")
    void invalidateAllCodesForUser(@Param("userId") Long userId);

    // Supprimer les codes expirés (pour nettoyage périodique)
    @Modifying
    @Transactional
    @Query("DELETE FROM CodeVerification cv WHERE cv.expiresAt < :now")
    void deleteExpiredCodes(@Param("now") LocalDateTime now);

    // Vérifier si un utilisateur a déjà un code valide récent
    @Query("SELECT COUNT(cv) > 0 FROM CodeVerification cv WHERE cv.userId = :userId AND cv.isUsed = false AND cv.expiresAt > :now")
    boolean hasValidCode(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
