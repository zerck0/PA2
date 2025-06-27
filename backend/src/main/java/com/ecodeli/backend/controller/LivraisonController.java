package com.ecodeli.backend.controller;

import com.ecodeli.model.Livraison;
import com.ecodeli.backend.service.LivraisonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/livraisons")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class LivraisonController {

    @Autowired
    private LivraisonService livraisonService;

    // === CRÉATION DE LIVRAISONS ===

    @PostMapping("/complete")
    public ResponseEntity<?> creerLivraisonComplete(
            @RequestParam Long annonceId,
            @RequestParam Long livreurId,
            @RequestParam(required = false) BigDecimal prixConvenu) {
        try {
            Livraison livraison = livraisonService.creerLivraisonComplete(annonceId, livreurId);
            
            if (prixConvenu != null) {
                livraison.setPrixConvenu(prixConvenu);
                // Note: Il faudrait sauvegarder à nouveau si on modifie le prix
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(livraison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/partielle-depot")
    public ResponseEntity<?> creerLivraisonPartielleDepot(
            @RequestParam Long annonceId,
            @RequestParam Long livreurId,
            @RequestParam Long entrepotId,
            @RequestParam(required = false) BigDecimal prixConvenu) {
        try {
            Livraison livraison = livraisonService.creerLivraisonPartielleDepot(annonceId, livreurId, entrepotId);
            
            if (prixConvenu != null) {
                livraison.setPrixConvenu(prixConvenu);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(livraison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/partielle-retrait")
    public ResponseEntity<?> creerLivraisonPartielleRetrait(
            @RequestParam Long annonceId,
            @RequestParam Long livreurId,
            @RequestParam Long entrepotId,
            @RequestParam(required = false) BigDecimal prixConvenu) {
        try {
            Livraison livraison = livraisonService.creerLivraisonPartielleRetrait(annonceId, livreurId, entrepotId);
            
            if (prixConvenu != null) {
                livraison.setPrixConvenu(prixConvenu);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(livraison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/assigner-livreur")
    public ResponseEntity<?> assignerLivreurLivraison(
            @PathVariable Long id,
            @RequestParam Long livreurId) {
        try {
            Livraison livraison = livraisonService.assignerLivreur(id, livreurId);
            return ResponseEntity.ok(livraison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // === GESTION DES STATUTS ===

    @PutMapping("/{id}/accepter")
    public ResponseEntity<?> accepterLivraison(@PathVariable Long id) {
        try {
            Livraison livraison = livraisonService.accepterLivraison(id);
            return ResponseEntity.ok(livraison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/commencer")
    public ResponseEntity<?> commencerLivraison(@PathVariable Long id) {
        try {
            Livraison livraison = livraisonService.commencerLivraison(id);
            return ResponseEntity.ok(livraison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/terminer")
    public ResponseEntity<?> terminerLivraison(
            @PathVariable Long id,
            @RequestParam String codeValidation) {
        try {
            Livraison livraison = livraisonService.terminerLivraison(id, codeValidation);
            return ResponseEntity.ok(livraison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<?> annulerLivraison(@PathVariable Long id) {
        try {
            Livraison livraison = livraisonService.annulerLivraison(id);
            return ResponseEntity.ok(livraison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // === CONSULTATION ===

    @GetMapping("/disponibles")
    public ResponseEntity<List<Livraison>> getLivraisonsDisponibles() {
        List<Livraison> livraisons = livraisonService.getLivraisonsDisponibles();
        return ResponseEntity.ok(livraisons);
    }

    @GetMapping("/livreur/{livreurId}")
    public ResponseEntity<List<Livraison>> getLivraisonsByLivreur(@PathVariable Long livreurId) {
        List<Livraison> livraisons = livraisonService.getLivraisonsByLivreur(livreurId);
        return ResponseEntity.ok(livraisons);
    }

    @GetMapping("/livreur/{livreurId}/en-cours")
    public ResponseEntity<List<Livraison>> getLivraisonsEnCoursByLivreur(@PathVariable Long livreurId) {
        List<Livraison> livraisons = livraisonService.getLivraisonsEnCoursByLivreur(livreurId);
        return ResponseEntity.ok(livraisons);
    }

    @GetMapping("/annonce/{annonceId}")
    public ResponseEntity<List<Livraison>> getLivraisonsByAnnonce(@PathVariable Long annonceId) {
        List<Livraison> livraisons = livraisonService.getLivraisonsByAnnonce(annonceId);
        return ResponseEntity.ok(livraisons);
    }

    @GetMapping("/entrepot/{entrepotId}/stockees")
    public ResponseEntity<List<Livraison>> getColisStockesInEntrepot(@PathVariable Long entrepotId) {
        List<Livraison> livraisons = livraisonService.getColisStockesInEntrepot(entrepotId);
        return ResponseEntity.ok(livraisons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livraison> getLivraisonById(@PathVariable Long id) {
        return livraisonService.getLivraisonById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{codeValidation}")
    public ResponseEntity<Livraison> getLivraisonByCode(@PathVariable String codeValidation) {
        return livraisonService.getLivraisonByCodeValidation(codeValidation)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // === STATISTIQUES ===

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = Map.of(
            "livraisonsEnAttente", livraisonService.getCountLivraisonsByStatut(Livraison.StatutLivraison.EN_ATTENTE),
            "livraisonsEnCours", livraisonService.getCountLivraisonsByStatut(Livraison.StatutLivraison.EN_COURS),
            "livraisonsTerminees", livraisonService.getCountLivraisonsByStatut(Livraison.StatutLivraison.LIVREE),
            "livraisonsCompletes", livraisonService.getCountLivraisonsByType(Livraison.TypeLivraison.COMPLETE),
            "livraisonsPartielles", 
                livraisonService.getCountLivraisonsByType(Livraison.TypeLivraison.PARTIELLE_DEPOT) +
                livraisonService.getCountLivraisonsByType(Livraison.TypeLivraison.PARTIELLE_RETRAIT)
        );
        return ResponseEntity.ok(stats);
    }

    // === UTILITAIRES ===

    @GetMapping("/annonce/{annonceId}/has-livraisons")
    public ResponseEntity<Map<String, Boolean>> annonceHasLivraisons(@PathVariable Long annonceId) {
        boolean hasLivraisons = livraisonService.annonceHasLivraisons(annonceId);
        return ResponseEntity.ok(Map.of("hasLivraisons", hasLivraisons));
    }
}
