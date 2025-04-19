package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    protected String nom;
    protected String prenom;
    protected String email;
    protected String password;
    protected String adresse;
    protected String ville;
    protected String codepostal;
    protected String telephone;
    protected LocalDate dateCreation;

    @Enumerated(EnumType.STRING)
    protected Role role;

    public enum Role {
        LIVREUR, CLIENT, PRESTATAIRE, COMMERCANT
    }

}
