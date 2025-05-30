package com.ecodeli.model.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AnnonceDTO {
    
    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 100, message = "Le titre ne peut pas dépasser 100 caractères")
    private String titre;
    
    @Size(max = 1000, message = "La description ne peut pas dépasser 1000 caractères")
    private String description;
    
    @NotBlank(message = "Le type d'annonce est obligatoire")
    private String type;
    
    @NotBlank(message = "L'adresse de départ est obligatoire")
    private String adresseDepart;
    
    @NotBlank(message = "L'adresse d'arrivée est obligatoire")
    private String adresseArrivee;
    
    @NotBlank(message = "La ville de départ est obligatoire")
    private String villeDepart;
    
    @NotBlank(message = "La ville d'arrivée est obligatoire")
    private String villeArrivee;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
    private BigDecimal prixPropose;
    
    private BigDecimal prixNegociable;
    
    private LocalDateTime dateLimite;
    private LocalDateTime datePreferee;
    
    // Champs spécifiques aux colis
    private String typeColis;
    
    @DecimalMin(value = "0.0", message = "Le poids doit être positif")
    private Double poids;
    
    private String dimensions;
    private Boolean fragile = false;
}
