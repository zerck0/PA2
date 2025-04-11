package com.ecodeli.model;

import jakarta.persistence.Entity;

@Entity
public class Prestataire extends Utilisateur{
    private String typeService;
    private boolean verifDossier = false;
    private float tarifHoraire;
    private float note;

    public String getTypeService() {
        return typeService;
    }

    public void setTypeService(String typeService) {
        this.typeService = typeService;
    }

    public float getTarifHoraire() {
        return tarifHoraire;
    }

    public void setTarifHoraire(float tarifHoraire) {
        this.tarifHoraire = tarifHoraire;
    }

    public boolean isVerifDossier() {
        return verifDossier;
    }

    public void setVerifDossier(boolean verifDossier) {
        this.verifDossier = verifDossier;
    }

    public float getNote() {
        return note;
    }

    public void setNote(float note) {
        this.note = note;
    }
}
