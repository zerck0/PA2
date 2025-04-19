package com.ecodeli.model;

import jakarta.persistence.Entity;
import lombok.Data;

@Data
@Entity
public class Prestataire extends Utilisateur{
    private String typeService;
    private boolean verifDossier = false;
    private float tarifHoraire;
    private float note;

    
}
