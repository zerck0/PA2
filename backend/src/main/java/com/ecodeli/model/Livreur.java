package com.ecodeli.model;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
public class Livreur extends Utilisateur {

    private String vehicule;
    private boolean permisVerif;
    private double note;
    private boolean dossierValide;

    
}
