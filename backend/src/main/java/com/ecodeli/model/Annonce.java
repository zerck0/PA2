package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Annonce {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String description;
    private String type; // LIVRAISON, SERVICE, TRANSPORT, etc.
    private LocalDateTime dateCreation;
    
    @Enumerated(EnumType.STRING)
    private AnnonceStatus statut;
    
    private String villeDepart;
    private String villeArrivee;
    private String adresseDepart;
    private String adresseArrivee;
    private LocalDateTime dateLivraison;
    private Double prix;
    
    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur createur;
    
    public enum AnnonceStatus {
        EN_ATTENTE, VALIDEE, REFUSEE, EN_COURS, TERMINEE
    }
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (statut == null) {
            statut = AnnonceStatus.EN_ATTENTE;
        }
    }
}
