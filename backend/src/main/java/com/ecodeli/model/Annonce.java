package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "annonces")
public class Annonce {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titre;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeAnnonce type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAnnonce statut = StatutAnnonce.ACTIVE;
    
    // Localisation
    @Column(nullable = false)
    private String adresseDepart;
    
    @Column(nullable = false)
    private String adresseArrivee;
    
    @Column(nullable = false)
    private String villeDepart;
    
    @Column(nullable = false)
    private String villeArrivee;
    
    // Tarification
    @Column(precision = 10, scale = 2)
    private BigDecimal prixPropose;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal prixNegociable;
    
    // Timing
    private LocalDateTime dateCreation;
    private LocalDateTime dateLimite;
    private LocalDateTime datePreferee;
    
    // Spécificités colis
    private String typeColis;
    private Double poids; // en kg
    private String dimensions; // "L x l x h cm"
    private Boolean fragile = false;
    
    // Relations
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "auteur_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Utilisateur auteur;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livreur_assigne_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Livreur livreurAssigne;
    
    // Enums
    public enum TypeAnnonce {
        LIVRAISON_COLIS,
        SERVICE_PERSONNE,
        TRANSPORT_PERSONNE,
        COURSES,
        ACHAT_ETRANGER
    }
    
    public enum StatutAnnonce {
        ACTIVE,
        ASSIGNEE,
        EN_COURS,
        TERMINEE,
        ANNULEE
    }
    
    @PrePersist
    public void prePersist() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }
}
