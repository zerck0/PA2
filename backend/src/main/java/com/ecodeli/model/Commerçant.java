package com.ecodeli.model;

import jakarta.persistence.Entity;

@Entity
public class Commerçant extends Utilisateur {
    private String nomEntreprise;
    private String SIRET;
    private String adresseCommerce;
    private boolean verifDossier;

    public String getNomEntreprise() {
        return nomEntreprise;
    }

    public void setNomEntreprise(String nomEntreprise) {
        this.nomEntreprise = nomEntreprise;
    }

    public String getSIRET() {
        return SIRET;
    }

    public void setSIRET(String SIRET) {
        this.SIRET = SIRET;
    }

    public String getAdresseCommerce() {
        return adresseCommerce;
    }

    public void setAdresseCommerce(String adresseCommerce) {
        this.adresseCommerce = adresseCommerce;
    }

    public boolean isVerifDossier() {
        return verifDossier;
    }

    public void setVerifDossier(boolean verifDossier) {
        this.verifDossier = verifDossier;
    }
}
