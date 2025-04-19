package com.ecodeli.model;

import jakarta.persistence.Entity;
import lombok.Data;

@Data
@Entity
public class Livreur extends Utilisateur {

    private String vehicule;
    private boolean permisVerif;
    private double note;
    private boolean dossierValide;

    
}
