package com.ecodeli.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
public class Livreur extends Utilisateur {

    private String vehicule;
    private boolean permisVerif;
    private double note;
    private boolean dossierValide;

    // Système d'affiliation
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_affiliation")
    private StatutAffiliation statutAffiliation = StatutAffiliation.NON_AFFILIE;
    
    @Column(name = "date_demande_affiliation")
    private LocalDateTime dateDemandeAffiliation;
    
    @Column(name = "date_validation_affiliation")
    private LocalDateTime dateValidationAffiliation;
    
    @Column(name = "commentaire_affiliation", length = 500)
    private String commentaireAffiliation;
    
    // Champs pour le profil public
    @Column(name = "biographie", length = 1000)
    private String biographie;
    
    @Column(name = "photo_profil_url")
    private String photoProfilUrl;

    // Enum pour le statut d'affiliation
    public enum StatutAffiliation {
        NON_AFFILIE,
        DEMANDE_AFFILIATION,
        AFFILIE,
        AFFILIATION_REFUSEE
    }
}
