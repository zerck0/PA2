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

    // NOUVELLE APPROCHE SIMPLIFIÉE
    @Column(name = "est_partielle", nullable = false)
    private Boolean estPartielle = false;  // true si livraison partielle, false si complète

    @Column(name = "segment_ordre")
    private Integer segmentOrdre;  // 1 = dépôt, 2 = retrait (null si complète)

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

    // ANCIEN ATTRIBUT CONSERVÉ POUR COMPATIBILITÉ MAIS PLUS UTILISÉ
    @Enumerated(EnumType.STRING)
    @Column(name = "type_livraison")
    private TypeLivraison typeLivraison;

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

    // NOUVELLES MÉTHODES UTILITAIRES SIMPLIFIÉES
    public boolean isPartielle() {
        return Boolean.TRUE.equals(estPartielle);
    }

    public boolean isComplete() {
        return Boolean.FALSE.equals(estPartielle);
    }

    public boolean isSegmentDepot() {
        return isPartielle() && Integer.valueOf(1).equals(segmentOrdre);
    }

    public boolean isSegmentRetrait() {
        return isPartielle() && Integer.valueOf(2).equals(segmentOrdre);
    }

    public boolean estEnCours() {
        return statut == StatutLivraison.EN_COURS;
    }

    public boolean estTerminee() {
        return statut == StatutLivraison.LIVREE || 
               statut == StatutLivraison.STOCKEE;
    }

    public boolean estStockee() {
        return statut == StatutLivraison.STOCKEE;
    }

    // MÉTHODES DE COMPATIBILITÉ (pour l'ancien code)
    public TypeLivraison getTypeLivraisonCalcule() {
        if (isComplete()) {
            return TypeLivraison.COMPLETE;
        } else if (isSegmentDepot()) {
            return TypeLivraison.PARTIELLE_DEPOT;
        } else if (isSegmentRetrait()) {
            return TypeLivraison.PARTIELLE_RETRAIT;
        }
        return TypeLivraison.COMPLETE; // fallback
    }
}
