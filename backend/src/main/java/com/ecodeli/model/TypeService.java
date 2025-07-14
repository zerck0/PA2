package com.ecodeli.model;

public enum TypeService {
    PRESTATION("Prestation"),
    LIVRAISON("Livraison");
    
    private final String libelle;
    
    TypeService(String libelle) {
        this.libelle = libelle;
    }
    
    public String getLibelle() {
        return libelle;
    }
    
    @Override
    public String toString() {
        return libelle;
    }
}
