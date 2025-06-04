package com.ecodeli.backend.controller;

import com.ecodeli.model.Annonce;
import com.ecodeli.model.Utilisateur;
import com.ecodeli.model.dto.AnnonceDTO;
import com.ecodeli.backend.service.AnnonceService;
import com.ecodeli.backend.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/annonces")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AnnonceController {
    
    @Autowired
    private AnnonceService annonceService;
    
    @Autowired
    private UtilisateurService utilisateurService;
    
    @GetMapping
    public ResponseEntity<List<Annonce>> getAllAnnonces() {
        List<Annonce> annonces = annonceService.getAllActiveAnnonces();
        return ResponseEntity.ok(annonces);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Annonce>> searchAnnonces(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) String type) {
        
        List<Annonce> annonces;
        
        if (ville != null && !ville.isEmpty()) {
            annonces = annonceService.searchAnnoncesByVille(ville);
        } else if (type != null && !type.isEmpty()) {
            try {
                Annonce.TypeAnnonce typeEnum = Annonce.TypeAnnonce.valueOf(type.toUpperCase());
                annonces = annonceService.getAnnoncesByType(typeEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            annonces = annonceService.getAllActiveAnnonces();
        }
        
        return ResponseEntity.ok(annonces);
    }
    
    @GetMapping("/mes-annonces/{userId}")
    public ResponseEntity<List<Annonce>> getMesAnnonces(@PathVariable Long userId) {
        List<Annonce> annonces = annonceService.getAnnoncesByAuteur(userId);
        return ResponseEntity.ok(annonces);
    }
    
    @PostMapping
    public ResponseEntity<?> createAnnonce(@Valid @RequestBody AnnonceDTO annonceDTO, 
                                          @RequestParam Long auteurId) {
        try {
            // Vérifier que l'auteur existe
            Optional<Utilisateur> auteur = utilisateurService.getUtilisateurById(auteurId);
            if (auteur.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Utilisateur non trouvé"));
            }
            
            // Conversion DTO -> Entity
            Annonce annonce = convertDtoToEntity(annonceDTO);
            annonce.setAuteur(auteur.get());
            
            Annonce nouvelleAnnonce = annonceService.createAnnonce(annonce);
            return ResponseEntity.status(HttpStatus.CREATED).body(nouvelleAnnonce);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de la création: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Annonce> getAnnonceById(@PathVariable Long id) {
        Optional<Annonce> annonce = annonceService.getAnnonceById(id);
        return annonce.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    private Annonce convertDtoToEntity(AnnonceDTO dto) {
        Annonce annonce = new Annonce();
        annonce.setTitre(dto.getTitre());
        annonce.setDescription(dto.getDescription());
        annonce.setType(Annonce.TypeAnnonce.valueOf(dto.getType().toUpperCase()));
        annonce.setAdresseDepart(dto.getAdresseDepart());
        annonce.setAdresseArrivee(dto.getAdresseArrivee());
        annonce.setVilleDepart(dto.getVilleDepart());
        annonce.setVilleArrivee(dto.getVilleArrivee());
        annonce.setPrixPropose(dto.getPrixPropose());
        annonce.setPrixNegociable(dto.getPrixNegociable());
        annonce.setDateLimite(dto.getDateLimite());
        annonce.setDatePreferee(dto.getDatePreferee());
        annonce.setTypeColis(dto.getTypeColis());
        annonce.setPoids(dto.getPoids());
        annonce.setDimensions(dto.getDimensions());
        annonce.setFragile(dto.getFragile());
        return annonce;
    }
}
