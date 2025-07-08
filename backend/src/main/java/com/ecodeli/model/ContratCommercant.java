package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "contrats_commercants")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ContratCommercant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "commercant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Utilisateur commercant;
    
    // Métadonnées du contrat
    @Column(name = "numero_contrat", nullable = false, unique = true)
    private String numeroContrat;
    
    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;
    
    @Column(name = "date_fin")
    private LocalDate dateFin;
    
    @Column(name = "date_signature", nullable = false)
    private LocalDate dateSignature;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_contrat", nullable = false)
    private StatutContrat statutContrat = StatutContrat.ACTIF;
    
    // Conditions tarifaires simplifiées
    @Column(name = "commission_pourcentage", precision = 5, scale = 2)
    private BigDecimal commissionPourcentage; // Ex: 15.50 pour 15,50%
    
    @Column(name = "frais_inscription", precision = 10, scale = 2)
    private BigDecimal fraisInscription; // Ex: 50.00€
    
    @Column(name = "abonnement_mensuel", precision = 10, scale = 2)
    private BigDecimal abonnementMensuel; // Ex: 29.99€/mois
    
    // Services inclus (simplifié)
    @Column(name = "livraison_rapide_incluse")
    private Boolean livraisonRapideIncluse = false;
    
    @Column(name = "assurance_incluse")
    private Boolean assuranceIncluse = false;
    
    @Column(name = "support_prioritaire")
    private Boolean supportPrioritaire = false;
    
    @Column(name = "nombre_livraisons_mensuelles")
    private Integer nombreLivraisonsMensuelles; // Limite mensuelle
    
    // Documents
    @Column(name = "url_contrat_pdf")
    private String urlContratPdf;
    
    @Column(name = "chemin_contrat_pdf")
    private String cheminContratPdf;
    
    // Enum pour le statut
    public enum StatutContrat {
        ACTIF,
        EXPIRE,
        SUSPENDU,
        RESILIÉ
    }
    
    @PrePersist
    public void prePersist() {
        if (numeroContrat == null) {
            // Génération automatique du numéro de contrat
            numeroContrat = "CT-" + System.currentTimeMillis();
        }
    }
}
