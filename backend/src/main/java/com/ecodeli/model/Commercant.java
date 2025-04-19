package com.ecodeli.model;

import jakarta.persistence.Entity;
import lombok.Data;

@Data
@Entity
public class Commercant extends Utilisateur {
    private String nomEntreprise;
    private String SIRET;
    private String adresseCommerce;
    private boolean verifDossier;

    
}
