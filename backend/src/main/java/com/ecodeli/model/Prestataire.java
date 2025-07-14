package com.ecodeli.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
public class Prestataire extends Utilisateur{
    private String typeService;
    private boolean verifDossier = false;
    private float tarifHoraire;
    private float note;
    
    // Nouvelles propriétés pour la configuration de la prestation
    @Column(columnDefinition = "TEXT")
    private String descriptionPrestation;
    
    @Enumerated(EnumType.STRING)
    private Prestation.TypePrestation typePrestationPrincipale;
    
    private String photoPrestation; // Chemin vers la photo
    
    private boolean profilConfigured = false; // Indique si le prestataire a configuré son profil
    
}
