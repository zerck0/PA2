package com.ecodeli.model.dto;

public class InscriptionDTO {
    public String role;
    public String nom;
    public String prenom;
    public String email;
    public String password;
    public String telephone;

    // Champs spécifiques
    public String vehicule;         // pour livreur
    public boolean permisVerif;     // pour livreur
    public String siret;            // pour commerçant
    public String typeService;      // pour prestataire
    public Double tarifHoraire;     // pour prestataire
}
