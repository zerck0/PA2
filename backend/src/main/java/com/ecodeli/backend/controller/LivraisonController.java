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
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174"})
public class LivraisonController {

    @Autowired
    private LivraisonService livraisonService;

    @PostMapping("/complete")
    public ResponseEntity<?> creerLivraisonComplete(
            @RequestParam Long annonceId,
            @RequestParam Long livreurId,
            @RequestParam(required = false) BigDecimal prixConvenu) {
        try {
            Livraison livraison = livraisonService.creerLivraisonComplete(annonceId, livreurId);
            
            if (prixConvenu != null) {
                livraison.setPrixConvenu(prixConvenu);
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
            Livraison livraison = livraisonService.prendreEnChargeAnnonce(annonceId, livreurId, "PARTIELLE_DEPOT", entrepotId);
            
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
            Livraison livraison = livraisonService.prendreEnChargeAnnonce(annonceId, livreurId, "PARTIELLE_RETRAIT", entrepotId);
            
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

    @PostMapping("/prendre-en-charge/{annonceId}")
    public ResponseEntity<?> prendreEnChargeAnnonce(
            @PathVariable Long annonceId,
            @RequestParam Long livreurId,
            @RequestParam String typeLivraison,
            @RequestParam(required = false) Long entrepotId) {
        try {
            Livraison livraison = livraisonService.prendreEnChargeAnnonce(annonceId, livreurId, typeLivraison, entrepotId);
            return ResponseEntity.status(HttpStatus.CREATED).body(livraison);
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

    @GetMapping("/code/{codeValidation}")
    public ResponseEntity<Livraison> getLivraisonByCode(@PathVariable String codeValidation) {
        return livraisonService.getLivraisonByCodeValidation(codeValidation)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = Map.of(
            "livraisonsEnCours", livraisonService.getCountLivraisonsByStatut(Livraison.StatutLivraison.EN_COURS),
            "livraisonsLivrees", livraisonService.getCountLivraisonsByStatut(Livraison.StatutLivraison.LIVREE),
            "livraisonsStockees", livraisonService.getCountLivraisonsByStatut(Livraison.StatutLivraison.STOCKEE),
            "livraisonsAnnulees", livraisonService.getCountLivraisonsByStatut(Livraison.StatutLivraison.ANNULEE),
            "livraisonsCompletes", livraisonService.getCountLivraisonsByType(Livraison.TypeLivraison.COMPLETE),
            "livraisonsPartielles", 
                livraisonService.getCountLivraisonsByType(Livraison.TypeLivraison.PARTIELLE_DEPOT) +
                livraisonService.getCountLivraisonsByType(Livraison.TypeLivraison.PARTIELLE_RETRAIT)
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/annonce/{annonceId}/has-livraisons")
    public ResponseEntity<Map<String, Boolean>> annonceHasLivraisons(@PathVariable Long annonceId) {
        boolean hasLivraisons = livraisonService.annonceHasLivraisons(annonceId);
        return ResponseEntity.ok(Map.of("hasLivraisons", hasLivraisons));
    }

    @GetMapping("/annonce/{annonceId}/segments-info")
    public ResponseEntity<Map<String, Object>> getSegmentsInfo(@PathVariable Long annonceId) {
        try {
            List<Livraison> livraisons = livraisonService.getLivraisonsByAnnonce(annonceId);
            
            boolean hasSegmentDepot = false;
            boolean hasSegmentRetrait = false;
            boolean hasLivraisonComplete = false;
            Long entrepotId = null;
            String entrepotNom = null;
            
            for (Livraison livraison : livraisons) {
                if (livraison.isPartielle()) {
                    if (livraison.getSegmentOrdre() != null) {
                        if (livraison.getSegmentOrdre() == 1) {
                            hasSegmentDepot = true;
                            if (livraison.getEntrepot() != null) {
                                entrepotId = livraison.getEntrepot().getId();
                                entrepotNom = livraison.getEntrepot().getNom();
                            }
                        } else if (livraison.getSegmentOrdre() == 2) {
                            hasSegmentRetrait = true;
                        }
                    }
                } else {
                    hasLivraisonComplete = true;
                }
            }
            
            Map<String, Object> result = Map.of(
                "hasSegmentDepot", hasSegmentDepot,
                "hasSegmentRetrait", hasSegmentRetrait,
                "hasLivraisonComplete", hasLivraisonComplete,
                "entrepotId", entrepotId != null ? entrepotId : 0,
                "entrepotNom", entrepotNom != null ? entrepotNom : "",
                "canCreateComplete", !hasSegmentDepot && !hasSegmentRetrait && !hasLivraisonComplete,
                "canCreatePartielleDepot", !hasSegmentDepot && !hasLivraisonComplete,
                "canCreatePartielleRetrait", hasSegmentDepot && !hasSegmentRetrait && !hasLivraisonComplete
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/annonce/{annonceId}/segment-depot")
    public ResponseEntity<?> getSegmentDepotByAnnonce(@PathVariable Long annonceId) {
        try {
            List<Livraison> livraisons = livraisonService.getLivraisonsByAnnonce(annonceId);
            
            for (Livraison livraison : livraisons) {
                if (livraison.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_DEPOT) {
                    return ResponseEntity.ok(livraison);
                }
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livraison> getLivraisonById(@PathVariable Long id) {
        return livraisonService.getLivraisonById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
