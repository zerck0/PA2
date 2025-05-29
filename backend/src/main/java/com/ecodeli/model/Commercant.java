package com.ecodeli.model;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
public class Commercant extends Utilisateur {
    private String nomEntreprise;
    private String SIRET;
    private String adresseCommerce;
    private boolean verifDossier;

    
}
