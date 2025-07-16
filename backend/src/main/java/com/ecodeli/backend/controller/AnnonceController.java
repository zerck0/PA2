package com.ecodeli.backend.controller;

import com.ecodeli.model.Annonce;
import com.ecodeli.model.Utilisateur;
import com.ecodeli.model.Livraison;
import com.ecodeli.model.dto.AnnonceDTO;
import com.ecodeli.backend.service.AnnonceService;
import com.ecodeli.backend.service.UtilisateurService;
import com.ecodeli.backend.service.LivraisonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/annonces")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174"})
public class AnnonceController {
    
    @Autowired
    private AnnonceService annonceService;
    
    @Autowired
    private UtilisateurService utilisateurService;
    
    @Autowired
    private LivraisonService livraisonService;
    
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
            System.out.println("=== DEBUG CREATION ANNONCE ===");
            System.out.println("AnnonceDTO reçu: " + annonceDTO);
            System.out.println("PhotoUrl dans DTO: " + annonceDTO.getPhotoUrl());
            
            // Vérifier que l'auteur existe
            Optional<Utilisateur> auteur = utilisateurService.getUtilisateurById(auteurId);
            if (auteur.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Utilisateur non trouvé"));
            }
            
            // Conversion DTO -> Entity
            Annonce annonce = convertDtoToEntity(annonceDTO);
            annonce.setAuteur(auteur.get());
            
            System.out.println("Annonce avant sauvegarde: " + annonce);
            System.out.println("PhotoUrl dans Entity: " + annonce.getPhotoUrl());
            
            Annonce nouvelleAnnonce = annonceService.createAnnonce(annonce);
            
            System.out.println("Annonce après sauvegarde: " + nouvelleAnnonce);
            System.out.println("PhotoUrl après sauvegarde: " + nouvelleAnnonce.getPhotoUrl());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(nouvelleAnnonce);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de la création: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Annonce> getAnnonceById(@PathVariable Long id) {
        return annonceService.getAnnonceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/segments")
    public ResponseEntity<Map<String, Object>> getAnnonceSegments(@PathVariable Long id) {
        try {
            Map<String, Object> segments = annonceService.getSegmentsInfo(id);
            return ResponseEntity.ok(segments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/livraisons")
    public ResponseEntity<List<Livraison>> getLivraisonsByAnnonce(@PathVariable Long id) {
        List<Livraison> livraisons = livraisonService.getLivraisonsByAnnonce(id);
        return ResponseEntity.ok(livraisons);
    }
    
    @GetMapping("/{id}/has-livraisons")
    public ResponseEntity<Map<String, Boolean>> annonceHasLivraisons(@PathVariable Long id) {
        boolean hasLivraisons = livraisonService.annonceHasLivraisons(id);
        return ResponseEntity.ok(Map.of("hasLivraisons", hasLivraisons));
    }
    
    @GetMapping("/{id}/statut-livraison")
    public ResponseEntity<Map<String, Object>> getStatutLivraisonAnnonce(@PathVariable Long id) {
        List<Livraison> livraisons = livraisonService.getLivraisonsByAnnonce(id);
        
        Map<String, Object> statut = Map.of(
            "hasLivraisons", !livraisons.isEmpty(),
            "nombreLivraisons", livraisons.size(),
            "livraisonsEnCours", livraisons.stream()
                .anyMatch(l -> l.getStatut() == Livraison.StatutLivraison.EN_COURS),
            "livraisonsTerminees", livraisons.stream()
                .anyMatch(l -> l.getStatut() == Livraison.StatutLivraison.LIVREE ||
                              l.getStatut() == Livraison.StatutLivraison.STOCKEE)
        );
        
        return ResponseEntity.ok(statut);
    }
    
    @PostMapping("/{id}/prendre-en-charge")
    public ResponseEntity<?> prendreEnCharge(@PathVariable Long id, @RequestParam Long livreurId) {
        try {
            Optional<Annonce> annonceOpt = annonceService.assignerLivreur(id, livreurId);
            if (annonceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Annonce non trouvée"));
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Annonce prise en charge avec succès ! Vous la retrouverez dans l'onglet 'Mes livraisons' de votre dashboard.",
                "annonce", annonceOpt.get()
            ));
                
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur lors de la prise en charge"));
        }
    }
    
    @GetMapping("/livreur/{livreurId}")
    public ResponseEntity<List<Annonce>> getAnnoncesByLivreur(@PathVariable Long livreurId) {
        List<Annonce> annonces = annonceService.getAnnoncesByLivreur(livreurId);
        return ResponseEntity.ok(annonces);
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
        
        // Conversion des prix
        annonce.setPrixPropose(dto.getPrixPropose());
        annonce.setPrixNegociable(dto.getPrixNegociable());
        
        // Conversion des dates
        try {
            if (dto.getDateLimite() != null && !dto.getDateLimite().isEmpty()) {
                annonce.setDateLimite(LocalDateTime.parse(dto.getDateLimite() + "T00:00:00"));
            }
            if (dto.getDatePreferee() != null && !dto.getDatePreferee().isEmpty()) {
                annonce.setDatePreferee(LocalDateTime.parse(dto.getDatePreferee() + "T00:00:00"));
            }
        } catch (Exception e) {
            // Log l'erreur mais continue sans les dates
            System.err.println("Erreur de parsing des dates: " + e.getMessage());
        }
        
        annonce.setTypeColis(dto.getTypeColis());
        annonce.setPoids(dto.getPoids());
        annonce.setDimensions(dto.getDimensions());
        annonce.setFragile(dto.getFragile() != null ? dto.getFragile() : false);
        annonce.setPhotoUrl(dto.getPhotoUrl());
        return annonce;
    }
}
