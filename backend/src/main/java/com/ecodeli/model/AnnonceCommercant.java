package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "annonces_commercants")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AnnonceCommercant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titre;
    
    @Column(length = 1000)
    private String description;
    
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
    
    // Spécificités commerçant
    @Column(length = 2000, nullable = false)
    private String listeCourses; // Liste des produits à acheter/livrer
    
    @Column(name = "quantite_produits")
    private Integer quantiteProduits; // Nombre total d'articles
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal prixPropose; // Prix fixé par le commerçant
    
    @Column(name = "reserve_aux_affilies")
    private Boolean reserveAuxAffilies = true; // Réservé aux livreurs affiliés
    
    // Timing
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
    
    @Column(name = "date_limite")
    private LocalDateTime dateLimite;
    
    @Column(name = "date_preferee")
    private LocalDateTime datePreferee;
    
    // Relations
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "commercant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Commercant commercant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livreur_assigne_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Livreur livreurAssigne;
    
    // Enum pour le statut
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
