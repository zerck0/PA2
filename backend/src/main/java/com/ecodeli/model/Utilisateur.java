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
    private Long id;

    private String nom;
    private String prenom;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String adresse;
    private String ville;
    private String codepostal;
    private String telephone;
    private LocalDate dateCreation;

    @Enumerated(EnumType.STRING)
    protected Role role;

    @Enumerated(EnumType.STRING)
    private StatutCompte statut = StatutCompte.NON_VERIFIE;

    public enum Role {
        LIVREUR, CLIENT, PRESTATAIRE, COMMERCANT, ADMIN
    }

    public enum StatutCompte {
        NON_VERIFIE, EN_ATTENTE, VALIDE, SUSPENDU, REFUSE
    }

}
