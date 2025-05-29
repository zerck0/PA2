package com.ecodeli.model;

import jakarta.persistence.Entity;
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

    
}
