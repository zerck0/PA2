package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "documents")
public class Document {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(nullable = false)
    private String cheminFichier;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDocument type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDocument statut = StatutDocument.EN_ATTENTE;
    
    @Column(nullable = false)
    private LocalDateTime dateUpload;
    
    private LocalDateTime dateValidation;
    
    private String commentaireValidation;
    
    @Column(nullable = false)
    private Long utilisateurId;
    
    // Enums
    public enum TypeDocument {
        PERMIS_CONDUIRE,
        CARTE_IDENTITE,
        ASSURANCE,
        KBIS,
        CERTIFICAT,
        PHOTO_ANNONCE
    }
    
    public enum StatutDocument {
        EN_ATTENTE,
        VALIDE,
        REFUSE
    }
    
    @PrePersist
    public void prePersist() {
        if (dateUpload == null) {
            dateUpload = LocalDateTime.now();
        }
    }
}
