package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Prestation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titre;
    
    @Column(nullable = false)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypePrestation typePrestation;
    
    @ManyToOne
    @JoinColumn(name = "prestataire_id", nullable = false)
    private Prestataire prestataire;
    
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @Column(nullable = false)
    private LocalDateTime dateDebut;
    
    @Column(nullable = false)
    private LocalDateTime dateFin;
    
    @Column(nullable = false)
    private String adresse;
    
    @Column(nullable = false)
    private String ville;
    
    @Column(nullable = false)
    private String codePostal;
    
    @Column(nullable = false)
    private Double prix;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutPrestation statut = StatutPrestation.RESERVEE;
    
    @Column
    private String commentairesClient;
    
    @Column
    private String commentairesPrestataire;
    
    @Column
    private LocalDateTime dateCreation = LocalDateTime.now();
    
    @Column
    private LocalDateTime dateModification;
    
    // Enum pour les types de prestations
    public enum TypePrestation {
        // Transports et Livraisons
        TRANSPORT_PERSONNE("Transport de personne"),
        TRANSFERT_AEROPORT("Transfert aéroport"),
        LIVRAISON_COLIS("Livraison de colis"),
        
        // Courses et Achats
        COURSES("Courses"),
        ACHAT_ETRANGER("Achat à l'étranger"),
        SHOPPING_ACCOMPAGNE("Shopping accompagné"),
        
        // Services à domicile
        MENAGE("Ménage"),
        JARDINAGE("Jardinage"),
        GARDE_ANIMAUX("Garde d'animaux"),
        CUISINE_DOMICILE("Cuisine à domicile"),
        
        // Services Personnels
        ACCOMPAGNEMENT_PERSONNE("Accompagnement de personne"),
        AIDE_ADMINISTRATIVE("Aide administrative"),
        GARDE_ENFANTS("Garde d'enfants"),
        
        // Travaux et Réparations
        BRICOLAGE("Bricolage"),
        REPARATION_ELECTROMENAGER("Réparation électroménager"),
        MONTAGE_MEUBLE("Montage de meubles"),
        
        // Education et Formation
        SOUTIEN_SCOLAIRE("Soutien scolaire"),
        COURS_PARTICULIER("Cours particulier"),
        FORMATION_INFORMATIQUE("Formation informatique");
        
        private final String libelle;
        
        TypePrestation(String libelle) {
            this.libelle = libelle;
        }
        
        public String getLibelle() {
            return libelle;
        }
        
        // Méthode utile pour grouper par catégorie
        public String getCategorie() {
            switch (this) {
                case TRANSPORT_PERSONNE:
                case TRANSFERT_AEROPORT:
                case LIVRAISON_COLIS:
                    return "Transports et Livraisons";
                    
                case COURSES:
                case ACHAT_ETRANGER:
                case SHOPPING_ACCOMPAGNE:
                    return "Courses et Achats";
                    
                case MENAGE:
                case JARDINAGE:
                case GARDE_ANIMAUX:
                case CUISINE_DOMICILE:
                    return "Services à domicile";
                    
                case ACCOMPAGNEMENT_PERSONNE:
                case AIDE_ADMINISTRATIVE:
                case GARDE_ENFANTS:
                    return "Services Personnels";
                    
                case BRICOLAGE:
                case REPARATION_ELECTROMENAGER:
                case MONTAGE_MEUBLE:
                    return "Travaux et Réparations";
                    
                case SOUTIEN_SCOLAIRE:
                case COURS_PARTICULIER:
                case FORMATION_INFORMATIQUE:
                    return "Education et Formation";
                    
                default:
                    return "Autre";
            }
        }
    }
    
    // Enum pour les statuts de prestations
    public enum StatutPrestation {
        RESERVEE("Réservée"),
        TERMINEE("Terminée"),
        EVALUEE("Évaluée"),
        ANNULEE("Annulée");
        
        private final String libelle;
        
        StatutPrestation(String libelle) {
            this.libelle = libelle;
        }
        
        public String getLibelle() {
            return libelle;
        }
    }
}
