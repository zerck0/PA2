package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "livraisons")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Livraison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonce_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Annonce annonce;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livreur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Livreur livreur;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_livraison", nullable = false)
    private TypeLivraison typeLivraison;

    @Column(name = "adresse_depart", nullable = false)
    private String adresseDepart;

    @Column(name = "adresse_arrivee", nullable = false)
    private String adresseArrivee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrepot_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Entrepot entrepot;

    @Enumerated(EnumType.STRING)
    private StatutLivraison statut = StatutLivraison.ASSIGNEE;

    @Column(name = "ordre_livraison")
    private Integer ordre = 1;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "code_validation", length = 10)
    private String codeValidation;

    @Column(name = "prix_convenu", precision = 10, scale = 2)
    private BigDecimal prixConvenu;

    @Column(columnDefinition = "TEXT")
    private String commentaires;

    public enum TypeLivraison {
        COMPLETE,           // Livraison directe de A à B
        PARTIELLE_DEPOT,    // De l'adresse vers un entrepôt
        PARTIELLE_RETRAIT   // De l'entrepôt vers l'adresse finale
    }

    public enum StatutLivraison {
        ASSIGNEE,       // Livraison assignée mais pas encore commencée
        EN_COURS,       // Livraison en cours de transport
        LIVREE,         // Livraison terminée avec succès
        STOCKEE,        // Colis stocké à l'entrepôt (pour livraisons partielles)
        ANNULEE         // Livraison annulée
    }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    // Méthodes utilitaires
    public boolean isPartielle() {
        return typeLivraison == TypeLivraison.PARTIELLE_DEPOT || 
               typeLivraison == TypeLivraison.PARTIELLE_RETRAIT;
    }

    public boolean isComplete() {
        return typeLivraison == TypeLivraison.COMPLETE;
    }

    public boolean estEnCours() {
        return statut == StatutLivraison.EN_COURS;
    }

    public boolean estTerminee() {
        return statut == StatutLivraison.LIVREE || 
               statut == StatutLivraison.STOCKEE;
    }
}
