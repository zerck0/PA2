package com.ecodeli.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Data
public class PlageDisponibilite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "prestataire_id", nullable = false)
    private Prestataire prestataire;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek jourSemaine;
    
    @Column(nullable = false)
    private LocalTime heureDebut;
    
    @Column(nullable = false)
    private LocalTime heureFin;
    
    @Column(nullable = false)
    private Boolean actif = true;
    
    // Pause déjeuner automatique 12h-13h
    public boolean isHeureDisponible(LocalTime heure) {
        if (!actif) return false;
        
        // Vérifier si l'heure est dans la plage générale
        if (heure.isBefore(heureDebut) || heure.isAfter(heureFin)) {
            return false;
        }
        
        // Bloquer automatiquement 12h-13h (pause déjeuner)
        LocalTime pauseDebut = LocalTime.of(12, 0);
        LocalTime pauseFin = LocalTime.of(13, 0);
        
        if (!heure.isBefore(pauseDebut) && heure.isBefore(pauseFin)) {
            return false;
        }
        
        return true;
    }
    
    // Vérifier si une plage horaire est disponible (pour réservation)
    public boolean isPlageDisponible(LocalTime debut, LocalTime fin) {
        if (!actif) return false;
        
        // Vérifier que la plage est entièrement dans les heures de travail
        if (debut.isBefore(heureDebut) || fin.isAfter(heureFin)) {
            return false;
        }
        
        // Vérifier qu'il n'y a pas de conflit avec la pause déjeuner
        LocalTime pauseDebut = LocalTime.of(12, 0);
        LocalTime pauseFin = LocalTime.of(13, 0);
        
        // La réservation ne doit pas chevaucher avec 12h-13h
        if (!(fin.isBefore(pauseDebut) || debut.isAfter(pauseFin))) {
            return false;
        }
        
        return true;
    }
}
