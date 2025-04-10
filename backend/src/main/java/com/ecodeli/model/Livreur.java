package com.ecodeli.model;

import jakarta.persistence.Entity;

@Entity
public class Livreur extends Utilisateur {

    private String vehicule;
    private boolean permisVerif;
    private double note;
    private boolean dossierValide;

    public String getVehicule() {
        return vehicule;
    }

    public void setVehicule(String vehicule) {
        this.vehicule = vehicule;
    }

    public boolean isPermisVerif() {
        return permisVerif;
    }

    public void setPermisVerif(boolean permisVerif) {
        this.permisVerif = permisVerif;
    }

    public double getNote() {
        return note;
    }

    public void setNote(double note) {
        this.note = note;
    }

    public boolean isDossierValide() {
        return dossierValide;
    }

    public void setDossierValide(boolean dossierValide) {
        this.dossierValide = dossierValide;
    }
}
