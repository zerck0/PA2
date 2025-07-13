package com.ecodeli.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InscriptionDTO {
    @NotBlank(message = "Le rôle est obligatoire")
    public String role;
    
    @NotBlank(message = "Le nom est obligatoire")
    public String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    public String prenom;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    public String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    public String motDePasse;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    public String telephone;
    
    // Nouveaux champs d'adresse
    public String adresse;
    public String ville;
    public String codePostal;
    
    // Champs optionnels selon le rôle
    public String vehicule;
    public Boolean permisVerif;
    public String siret;
    public String typeService;
    public Double tarifHoraire;
}
